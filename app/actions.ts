'use server'

import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'metadata-db.json')

export async function saveScholarshipMetadata(id: string, metadata: any) {
  let cid = null;
  // Upload to Pinata IPFS
  try {
    const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PINATA_JWT}`
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: { name: `Scholarship-${id}.json` }
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      cid = data.IpfsHash;
      console.log('Pinned to IPFS with CID:', cid);
    } else {
      console.error('Failed to pin to IPFS:', await res.text());
    }
  } catch (error) {
    console.error('IPFS error:', error);
  }

  let db: Record<string, any> = {}
  try {
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    }
  } catch (e) {
    console.error('Error reading db', e)
  }
  
  db[id] = { ...metadata, cid }
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

export async function getScholarshipMetadata(id: string) {
  try {
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
      return db[id] || null
    }
  } catch (e) {
    console.error('Error reading db', e)
  }
  return null
}
