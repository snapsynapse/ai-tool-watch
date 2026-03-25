/**
 * Internal consistency checking for feature data
 * Catches contradictions within data files that model verification might miss
 */

/**
 * Check a feature's data for internal contradictions
 * @param {Object} feature - Parsed feature object (has .name, .gating, .availability[], .platforms[])
 * @returns {{ issues: Array<{field: string, message: string, severity: 'error'|'warning'}>, hasErrors: boolean, hasWarnings: boolean }}
 */
function checkConsistency(feature) {
    const issues = [];

    const freePlan = feature.availability?.find(a =>
        a.plan?.toLowerCase() === 'free'
    );

    // Rule 1: Gating "free" but Free plan ❌
    if (feature.gating === 'free' && freePlan && freePlan.available === '❌') {
        issues.push({
            field: 'gating vs availability',
            message: `Gating is "free" but Free plan shows ❌ in availability table`,
            severity: 'error'
        });
    }

    // Rule 2: Gating "paid" but Free plan ✅ (⚠️ is OK — limited access is valid)
    if (feature.gating === 'paid' && freePlan && freePlan.available === '✅') {
        issues.push({
            field: 'gating vs availability',
            message: `Gating is "paid" but Free plan shows ✅ in availability table`,
            severity: 'error'
        });
    }

    // Rule 3: Web ✅ but Linux ❌ (warning — some features are native-only)
    const webPlatform = feature.platforms?.find(p =>
        p.platform?.toLowerCase() === 'web'
    );
    const linuxPlatform = feature.platforms?.find(p =>
        p.platform?.toLowerCase() === 'linux'
    );
    if (webPlatform?.available === '✅' && linuxPlatform?.available === '❌') {
        issues.push({
            field: 'platforms',
            message: `Web is ✅ but Linux is ❌ — if web-based, Linux users can access via browser`,
            severity: 'warning'
        });
    }

    return {
        issues,
        hasErrors: issues.some(i => i.severity === 'error'),
        hasWarnings: issues.some(i => i.severity === 'warning')
    };
}

module.exports = { checkConsistency };
