// js/state.js

export const assumptions = {
    // User Growth
    startingMAU: { value: 0, note: '' },
    year1TargetMAU: { value: 0, note: '' },
    year2TargetMAU: { value: 0, note: '' },
    year3TargetMAU: { value: 0, note: '' },
    year4TargetMAU: { value: 0, note: '' },
    year5TargetMAU: { value: 0, note: '' },
    // B2C Pricing
    premiumSubscriptionPrice: { value: 0, note: '' },
    premiumAdoptionRate: { value: 0, note: '' },
    adRevenuePerUser: { value: 0, note: '' },
    affiliateCommissionRate: { value: 0, note: '' },
    // B2B Pricing
    socialTierPrice: { value: 0, note: '' },
    broadcastTierPrice: { value: 0, note: '' },
    broadcastPlusTierPrice: { value: 0, note: '' },
    usageFeePerSecond: { value: 0, note: '' },
};

export const fixedInputs = {
    b2bCustomers: {
        socialTier: [],
        broadcastTier: [],
        broadcastPlusTier: [],
    },
    secondsLicensed: [],
    costs: {
        cogs: {
            contentCreation: [],
            platformInfrastructure: [],
        },
        opex: {
            salaries: [],
            marketing: [],
            operations: [],
            technology: [],
        }
    }
};

export const state = {
    // Projections, KPIs, etc. will be stored here
    projections: {},
    kpis: {},
};

function parseValue(value) {
    if (typeof value !== 'string') return value;

    // Just clean the string and convert to a number.
    // Percentage conversion will be handled in the calculation logic.
    const cleaned = value.replace(/[£,%]/g, '').trim();
    const number = parseFloat(cleaned);

    return isNaN(number) ? value : number;
}

export function parseFinancialData(htmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const rows = doc.querySelectorAll('.waffle tbody tr');

    const assumptionMap = {
        'Starting MAU': 'startingMAU',
        'Year 1 Target MAU': 'year1TargetMAU',
        'Year 2 Target MAU': 'year2TargetMAU',
        'Year 3 Target MAU': 'year3TargetMAU',
        'Year 4 Target MAU': 'year4TargetMAU',
        'Year 5 Target MAU': 'year5TargetMAU',
        'Premium Subscription Price': 'premiumSubscriptionPrice',
        'Premium Adoption Rate': 'premiumAdoptionRate',
        'Ad Revenue per User': 'adRevenuePerUser',
        'Affiliate Commission Rate': 'affiliateCommissionRate',
        'Social Tier Price': 'socialTierPrice',
        'Broadcast Tier Price': 'broadcastTierPrice',
        'Broadcast+ Tier Price': 'broadcastPlusTierPrice',
        'Usage Fee per Second': 'usageFeePerSecond',
    };

    let mode = 'none'; // Will change to 'assumptions', 'b2b', 'cogs', 'opex'

    const yearlyDataMap = {
        'Social Tier Customers': fixedInputs.b2bCustomers.socialTier,
        'Broadcast Tier Customers': fixedInputs.b2bCustomers.broadcastTier,
        'Broadcast+ Tier Customers': fixedInputs.b2bCustomers.broadcastPlusTier,
        'Seconds Licensed (000s)': fixedInputs.secondsLicensed,
        'Content Creation & Processing': fixedInputs.costs.cogs.contentCreation,
        'Platform Infrastructure': fixedInputs.costs.cogs.platformInfrastructure,
        'Salaries & Benefits': fixedInputs.costs.opex.salaries,
        'Marketing & Growth': fixedInputs.costs.opex.marketing,
        'Operations & Legal': fixedInputs.costs.opex.operations,
        'Technology & Infrastructure': fixedInputs.costs.opex.technology,
    };

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 0) return;

        const firstCellText = cells[0].textContent.trim();

        // Update parsing mode based on section headers
        if (firstCellText.includes('1. KEY ASSUMPTIONS & INPUTS')) {
            mode = 'assumptions';
            return;
        }
        if (firstCellText.includes('2. REVENUE PROJECTIONS')) {
            mode = 'b2b'; // Start of B2B data
            return; 
        }
        if (firstCellText.includes('3. COST STRUCTURE')) {
            mode = 'costs'; // Start of Cost data
            return;
        }
        if (firstCellText.includes('4. PROFIT & LOSS SUMMARY')) {
            mode = 'none'; // End of relevant data
            return;
        }

        if (mode === 'assumptions') {
            const key = firstCellText;
            const mappedKey = assumptionMap[key];
            
            if (mappedKey && cells.length > 3) { 
                const rawValue = cells[1].textContent.trim();
                const note = cells[3].textContent.trim();
                
                if (rawValue) {
                     assumptions[mappedKey] = {
                        value: parseValue(rawValue),
                        note: note || '',
                    };
                }
            }
        } else if (mode === 'b2b' || mode === 'costs') {
            const targetArray = yearlyDataMap[firstCellText];
            if (targetArray && cells.length > 5) {
                for (let i = 1; i <= 5; i++) {
                    targetArray.push(parseValue(cells[i].textContent));
                }
            }
        }
    });

    console.log('Parsed Assumptions:', assumptions);
    console.log('Parsed Fixed Inputs:', fixedInputs);
} 