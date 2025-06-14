export function calculateProjections(assumptions) {
    const yearlyProjections = [];
    const mauTargets = [
        assumptions.year1TargetMAU.value,
        assumptions.year2TargetMAU.value,
        assumptions.year3TargetMAU.value,
        assumptions.year4TargetMAU.value,
        assumptions.year5TargetMAU.value,
    ];

    let currentMAU = assumptions.startingMAU.value;

    for (let i = 0; i < 5; i++) {
        const year = i + 1;
        const targetMAU = mauTargets[i];
        
        // For simplicity, we'll use an average MAU for yearly calculations.
        // A more complex model would calculate this month-by-month.
        const averageMAU = (currentMAU + targetMAU) / 2;

        // Correctly handle percentage-based assumptions by dividing by 100
        const adoptionRate = assumptions.premiumAdoptionRate.value / 100;
        const commissionRate = assumptions.affiliateCommissionRate.value / 100;

        // B2C Revenue
        const premiumSubsRevenue = averageMAU * adoptionRate * assumptions.premiumSubscriptionPrice.value * 12;
        const adRevenue = year >= 3 ? averageMAU * assumptions.adRevenuePerUser.value * 12 : 0;
        const affiliateRevenue = premiumSubsRevenue * commissionRate;

        const totalB2CRevenue = premiumSubsRevenue + adRevenue + affiliateRevenue;

        // B2B Revenue
        const socialTierCustomers = assumptions.initialSocialTierCustomers.value * Math.pow(2, i);
        const broadcastTierCustomers = assumptions.initialBroadcastTierCustomers.value * Math.pow(2, i);
        const broadcastPlusTierCustomers = assumptions.initialBroadcastPlusTierCustomers.value * Math.pow(2, i);
        const secondsLicensed = assumptions.initialSecondsLicensed.value * Math.pow(4, i); // Faster growth for usage

        const socialTierRevenue = socialTierCustomers * assumptions.socialTierPrice.value * 12;
        const broadcastTierRevenue = broadcastTierCustomers * assumptions.broadcastTierPrice.value * 12;
        const broadcastPlusTierRevenue = broadcastPlusTierCustomers * assumptions.broadcastPlusTierPrice.value * 12;
        const usageFeeRevenue = secondsLicensed * 1000 * assumptions.usageFeePerSecond.value;

        const totalB2BRevenue = socialTierRevenue + broadcastTierRevenue + broadcastPlusTierRevenue + usageFeeRevenue;

        const totalRevenue = totalB2CRevenue + totalB2BRevenue;

        // Costs & Profitability
        // Simplified cost model: costs grow as a % of the initial revenue ratio
        const initialTotalRevenue = 364640; // From spreadsheet Year 1
        const cogsRatio = (assumptions.contentCreationProcessing.value + assumptions.platformInfrastructure.value) / initialTotalRevenue;
        const opExRatio = (assumptions.salariesBenefits.value + assumptions.marketingGrowth.value + assumptions.operationsLegal.value + assumptions.technologyInfrastructure.value) / initialTotalRevenue;

        const totalCOGS = totalRevenue * cogsRatio;
        const totalOpEx = totalRevenue * opExRatio;
        const grossProfit = totalRevenue - totalCOGS;
        const ebitda = grossProfit - totalOpEx;

        yearlyProjections.push({
            year: year,
            mau: targetMAU,
            revenue: {
                premiumSubscriptions: premiumSubsRevenue,
                adRevenue: adRevenue,
                affiliateRevenue: affiliateRevenue,
                totalB2C: totalB2CRevenue,
                socialTier: socialTierRevenue,
                broadcastTier: broadcastTierRevenue,
                broadcastPlusTier: broadcastPlusTierRevenue,
                usageFees: usageFeeRevenue,
                totalB2B: totalB2BRevenue,
                total: totalRevenue,
            },
            costs: {
                totalCOGS: totalCOGS,
                totalOpEx: totalOpEx,
            },
            profitability: {
                grossProfit: grossProfit,
                ebitda: ebitda,
            }
        });

        currentMAU = targetMAU;
    }

    return { yearly: yearlyProjections };
} 