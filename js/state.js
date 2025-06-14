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
    // B2B Customers (Year 1)
    initialSocialTierCustomers: { value: 0, note: '' },
    initialBroadcastTierCustomers: { value: 0, note: '' },
    initialBroadcastPlusTierCustomers: { value: 0, note: '' },
    initialSecondsLicensed: { value: 0, note: '' },
    // Costs (COGS)
    contentCreationProcessing: { value: 0, note: '' },
    platformInfrastructure: { value: 0, note: '' },
    // Costs (OpEx)
    salariesBenefits: { value: 0, note: '' },
    marketingGrowth: { value: 0, note: '' },
    operationsLegal: { value: 0, note: '' },
    technologyInfrastructure: { value: 0, note: '' },
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
        'Social Tier Customers': 'initialSocialTierCustomers',
        'Broadcast Tier Customers': 'initialBroadcastTierCustomers',
        'Broadcast+ Tier Customers': 'initialBroadcastPlusTierCustomers',
        'Seconds Licensed (000s)': 'initialSecondsLicensed',
        'Content Creation & Processing': 'contentCreationProcessing',
        'Platform Infrastructure': 'platformInfrastructure',
        'Salaries & Benefits': 'salariesBenefits',
        'Marketing & Growth': 'marketingGrowth',
        'Operations & Legal': 'operationsLegal',
        'Technology & Infrastructure': 'technologyInfrastructure',
    };

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 1) {
            const key = cells[0].textContent.trim();
            const mappedKey = assumptionMap[key];
            if (mappedKey) {
                const rawValue = cells[1].textContent;
                const note = cells[3] ? cells[3].textContent.trim() : '';
                assumptions[mappedKey] = {
                    value: parseValue(rawValue),
                    note: note,
                };
            }
        }
    });

    console.log('Parsed Assumptions:', assumptions);
} 