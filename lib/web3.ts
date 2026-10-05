import { ethers } from 'ethers';
import ScholarVaultData from './ScholarVaultABI.json';
import MockUSDTData from './MockUSDTABI.json';
import { saveScholarshipMetadata, getScholarshipMetadata } from '@/app/actions';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const BOT_TESTNET = {
  chainId: '0x3c8', // 968
  chainName: 'BOT Chain Testnet',
  nativeCurrency: { name: 'BOHR', symbol: 'BOHR', decimals: 18 },
  rpcUrls: ['https://rpc.bohr.life'],
  blockExplorerUrls: ['https://scan.bohr.life'],
};

export async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('Please install MetaMask to use this feature.');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  
  // 1. Request access first
  await provider.send('eth_requestAccounts', []);

  // 2. Switch or add the BOT Testnet chain
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BOT_TESTNET.chainId }],
    });
  } catch (switchError: any) {
    // 4902 error code means the chain hasn't been added to MetaMask yet
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [BOT_TESTNET],
      });
    } else {
      throw switchError;
    }
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  
  return { provider, signer, address };
}

export async function mintTestUSDT() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const usdtAddress = process.env.NEXT_PUBLIC_USDT_ADDRESS as string;
  const usdtContract = new ethers.Contract(usdtAddress, MockUSDTData.abi, signer);
  
  const tx = await usdtContract.mint(await signer.getAddress(), ethers.parseUnits('10000', 6));
  await tx.wait();
  return tx.hash;
}

export async function processDonation(scholarshipId: string, amount: string) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS as string;
  const usdtAddress = process.env.NEXT_PUBLIC_USDT_ADDRESS as string;

  const usdtContract = new ethers.Contract(usdtAddress, MockUSDTData.abi, signer);
  const vaultContract = new ethers.Contract(vaultAddress, ScholarVaultData.abi, signer);

  // Parse amount with 6 decimals for USDT
  const amountParsed = ethers.parseUnits(amount, 6);

  // 1. Approve USDT
  const approveTx = await usdtContract.approve(vaultAddress, amountParsed);
  await approveTx.wait();

  // 2. Donate
  const parsed = parseInt(scholarshipId.replace(/\D/g, ''));
  const numericId = isNaN(parsed) ? 0 : parsed;
  const donateTx = await vaultContract.donate(numericId, amountParsed);
  await donateTx.wait();

  return donateTx.hash;
}

export async function fetchScholarships() {
  const provider = new ethers.JsonRpcProvider(BOT_TESTNET.rpcUrls[0]);
  const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS as string;
  const vaultContract = new ethers.Contract(vaultAddress, ScholarVaultData.abi, provider);

  const nextId = await vaultContract.nextScholarshipId();
  const count = Number(nextId);
  const fetchedScholarships = [];

  const colors = [
    'from-violet-500 to-indigo-600',
    'from-orange-400 to-rose-500',
    'from-cyan-500 to-blue-600',
    'from-emerald-400 to-teal-500',
    'from-pink-500 to-rose-600'
  ];

  for (let i = 0; i < count; i++) {
    const data = await vaultContract.scholarships(i);
    
    // Calculate days left
    const now = Math.floor(Date.now() / 1000);
    const deadlineStr = Number(data.deadline) > now 
      ? `${Math.ceil((Number(data.deadline) - now) / 86400)} days left` 
      : 'Expired';

    // Fetch off-chain metadata if available
    const meta = await getScholarshipMetadata(i.toString()) || {
      name: `Student ${data.student.slice(0, 6)}...${data.student.slice(-4)}`,
      program: 'On-chain Program',
      school: 'Verified Institution'
    };

    fetchedScholarships.push({
      id: i.toString(),
      initials: meta.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || data.student.slice(2, 4).toUpperCase(),
      name: meta.name,
      program: meta.program,
      school: meta.school,
      raised: Number(ethers.formatUnits(data.raised, 6)),
      target: Number(ethers.formatUnits(data.target, 6)),
      deadline: deadlineStr,
      color: colors[i % colors.length],
      verified: true,
      studentAddress: data.student
    });
  }

  return fetchedScholarships.reverse(); // Newest first
}

export async function createScholarship(
  student: string,
  targetAmount: string,
  durationDays: string,
  metadata: { name: string, program: string, school: string }
) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS as string;
  
  const vaultContract = new ethers.Contract(vaultAddress, ScholarVaultData.abi, signer);
  
  // Save off-chain metadata locally
  const nextId = await vaultContract.nextScholarshipId();
  await saveScholarshipMetadata(nextId.toString(), metadata);
  
  // Parse target with 6 decimals for USDT
  const targetParsed = ethers.parseUnits(targetAmount, 6);
  
  // Calculate absolute deadline in seconds
  const durationSeconds = parseInt(durationDays) * 86400;
  const deadline = Math.floor(Date.now() / 1000) + durationSeconds;
  
  // Divide target into 3 tranches
  const tranche1 = targetParsed / BigInt(3);
  const tranche2 = targetParsed / BigInt(3);
  const tranche3 = targetParsed - tranche1 - tranche2;
  const trancheAmounts = [tranche1, tranche2, tranche3];
  
  // Hash the metadata to store on-chain for integrity proofs
  const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(metadata)));

  const tx = await vaultContract.createScholarship(
    student,
    targetParsed,
    deadline,
    trancheAmounts,
    metadataHash
  );

  await tx.wait();
  return tx.hash;
}

export async function submitMilestoneProof(scholarshipId: string, documentUri: string) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS as string;
  const vaultContract = new ethers.Contract(vaultAddress, ScholarVaultData.abi, signer);
  
  const numericId = parseInt(scholarshipId);
  const reportHash = ethers.keccak256(ethers.toUtf8Bytes(documentUri));

  const tx = await vaultContract.submitReport(numericId, reportHash, documentUri);
  await tx.wait();
  return tx.hash;
}

export async function checkIsAdmin(walletAddress: string) {
  const provider = new ethers.JsonRpcProvider(BOT_TESTNET.rpcUrls[0]);
  const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS as string;
  const vaultContract = new ethers.Contract(vaultAddress, ScholarVaultData.abi, provider);
  const admin = await vaultContract.admin();
  return admin.toLowerCase() === walletAddress.toLowerCase();
}

export async function fetchReports(scholarshipId: string) {
  const provider = new ethers.JsonRpcProvider(BOT_TESTNET.rpcUrls[0]);
  const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS as string;
  const vaultContract = new ethers.Contract(vaultAddress, ScholarVaultData.abi, provider);
  const count = await vaultContract.reportCount(scholarshipId);
  const reports = [];
  for (let i = 0; i < count; i++) {
    const report = await vaultContract.reports(scholarshipId, i);
    reports.push({
      timestamp: Number(report.timestamp),
      student: report.student,
      uri: report.uri
    });
  }
  return reports;
}

export async function getNextTrancheIndex(scholarshipId: string) {
  const provider = new ethers.JsonRpcProvider(BOT_TESTNET.rpcUrls[0]);
  const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS as string;
  const vaultContract = new ethers.Contract(vaultAddress, ScholarVaultData.abi, provider);
  const count = await vaultContract.trancheCount(scholarshipId);
  for (let i = 0; i < Number(count); i++) {
    const tranche = await vaultContract.tranches(scholarshipId, i);
    if (!tranche.released) {
      return i;
    }
  }
  return -1;
}

export async function releaseTranche(scholarshipId: string, trancheIndex: number) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS as string;
  const vaultContract = new ethers.Contract(vaultAddress, ScholarVaultData.abi, signer);
  const numericId = parseInt(scholarshipId);
  const tx = await vaultContract.releaseTranche(numericId, trancheIndex);
  await tx.wait();
  return tx.hash;
}
