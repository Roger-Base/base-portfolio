// Base Portfolio Viewer

const BASE_RPC = 'https://mainnet.base.org';

// Common Base tokens (addresses)
const TOKENS = [
    { address: '0x000000000000000000000000000000000000000000', symbol: 'ETH', decimals: 18, name: 'Ethereum' },
    { address: '0x4ed4e862860bed51dd957b95f991f5d9605c15a2', symbol: 'USDC', decimals: 6, name: 'USD Coin' },
    { address: '0xd9aaec86b65d86f6a7b5b1b0c0b4f1110a9f4ae', symbol: 'USDbC', decimals: 6, name: 'USD Base Coin' },
    { address: '0xac1bd2486aafd5f7fdc4e6704c0e2558e72ce10b', symbol: 'CBBTC', decimals: 8, name: 'Coinbase Wrapped BTC' },
    { address: '0x0b47e3a346c2e5d3d0e89b5c6a1e9f2e5d9f4c1a', symbol: 'DEGEN', decimals: 18, name: 'Degen' },
    { address: '0x3c7516edddccb19d1f8d3a1a7d2b1e5b3e9c6a1', symbol: 'BALD', decimals: 18, name: 'BALD' },
    { address: '0x0f4b2c4a6d8e9f1a2b3c4d5e6f7a8b9c0d1e2f3', symbol: 'STONE', decimals: 18, name: 'Staked Ether' },
];

// Token prices (mock for demo - in production use API)
const PRICES = {
    'ETH': 1980,
    'USDC': 1.0,
    'USDbC': 1.0,
    'CBBTC': 98000,
    'DEGEN': 0.001,
    'BALD': 0.0001,
    'STONE': 1980,
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('lookupBtn').addEventListener('click', lookup);
    document.getElementById('addressInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') lookup();
    });
});

async function lookup() {
    const address = document.getElementById('addressInput').value.trim();
    const addressInfo = document.getElementById('addressInfo');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    
    // Reset UI
    addressInfo.classList.add('hidden');
    error.classList.add('hidden');
    
    // Validate address
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        showError('Please enter a valid Base address (0x... 40 characters)');
        return;
    }
    
    loading.classList.remove('hidden');
    
    try {
        // Get ETH balance
        const ethBalance = await getBalance(address);
        
        // Check if contract
        const isContract = await isContractAddress(address);
        
        // Display results
        displayAddress(address, isContract, ethBalance);
        
        addressInfo.classList.remove('hidden');
    } catch (e) {
        showError(e.message);
    } finally {
        loading.classList.add('hidden');
    }
}

async function getBalance(address) {
    const response = await fetch(BASE_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [address, 'latest'],
            id: 1
        })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    return parseInt(data.result, 16) / 1e18;
}

async function isContractAddress(address) {
    const response = await fetch(BASE_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getCode',
            params: [address, 'latest'],
            id: 1
        })
    });
    
    const data = await response.json();
    return data.result && data.result !== '0x';
}

function displayAddress(address, isContract, ethBalance) {
    // Display short address
    document.getElementById('displayAddress').textContent = 
        address.slice(0, 6) + '...' + address.slice(-4);
    document.getElementById('displayAddress').title = address;
    
    // Address type
    document.getElementById('addressType').textContent = isContract ? 'Contract' : 'Wallet';
    document.getElementById('addressType').className = isContract ? 'badge contract' : 'badge eoa';
    
    // ETH balance
    const ethValue = ethBalance * PRICES['ETH'];
    document.getElementById('totalValue').textContent = '$' + ethValue.toFixed(2);
    
    // Token list (just ETH for now - adding more requires more API calls)
    const tokenList = document.getElementById('tokenList');
    tokenList.innerHTML = `
        <div class="token-row">
            <div class="token-info">
                <span class="token-symbol">ETH</span>
                <span class="token-name">Ethereum</span>
            </div>
            <div class="token-balance">
                <span class="amount">${ethBalance.toFixed(6)}</span>
                <span class="value">$${ethValue.toFixed(2)}</span>
            </div>
        </div>
    `;
}

function showError(msg) {
    const error = document.getElementById('error');
    error.textContent = msg;
    error.classList.remove('hidden');
}
