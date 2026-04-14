"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CAPABILITY_LABELS = exports.CATEGORY_LABELS = exports.BADGE_THRESHOLDS = exports.POINT_RULES = void 0;
exports.computeBadgeTier = computeBadgeTier;
exports.POINT_RULES = {
    AGENT_HIRED: 10,
    FIVE_STAR_REVIEW: 50,
    FEATURED: 100,
    FIRST_PUBLISH: 25,
    REVIEW_HELPFUL: 5,
};
exports.BADGE_THRESHOLDS = {
    '新星': { min: 0, max: 99 },
    '成长者': { min: 100, max: 499 },
    '精英': { min: 500, max: 1999 },
    '大师': { min: 2000, max: Infinity },
};
exports.CATEGORY_LABELS = {
    coding: { zh: '编程开发', en: 'Coding' },
    writing: { zh: '写作创作', en: 'Writing' },
    research: { zh: '研究调查', en: 'Research' },
    data_analysis: { zh: '数据分析', en: 'Data Analysis' },
    customer_service: { zh: '客户服务', en: 'Customer Service' },
    education: { zh: '教育培训', en: 'Education' },
    creative: { zh: '创意设计', en: 'Creative' },
    productivity: { zh: '效率工具', en: 'Productivity' },
    legal: { zh: '法律咨询', en: 'Legal' },
    finance: { zh: '财务金融', en: 'Finance' },
    other: { zh: '其他', en: 'Other' },
};
exports.CAPABILITY_LABELS = {
    web_search: { zh: '网络搜索', en: 'Web Search' },
    code_execution: { zh: '代码执行', en: 'Code Execution' },
    image_generation: { zh: '图像生成', en: 'Image Generation' },
    file_reading: { zh: '文件读取', en: 'File Reading' },
    database_query: { zh: '数据库查询', en: 'Database Query' },
    email_send: { zh: '发送邮件', en: 'Email Send' },
    calendar_access: { zh: '日历访问', en: 'Calendar Access' },
    browser_control: { zh: '浏览器控制', en: 'Browser Control' },
    memory: { zh: '长期记忆', en: 'Memory' },
    multi_agent: { zh: '多智能体', en: 'Multi-Agent' },
};
function computeBadgeTier(totalPoints) {
    for (const [tier, range] of Object.entries(exports.BADGE_THRESHOLDS)) {
        if (totalPoints >= range.min && totalPoints <= range.max)
            return tier;
    }
    return '新星';
}
