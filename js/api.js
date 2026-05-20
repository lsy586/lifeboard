// Supabase 백엔드 동기화
async function refreshAllServerData() {
    try {
        const { data: users, error: uErr } = await sb.from('crew_users').select('*').order('id', { ascending: true });
        if(uErr) throw uErr;
        cachedCrewUsers = users || [];

        const { data: cats, error: cErr } = await sb.from('study_categories').select('*');
        if(cErr) throw cErr;
        cachedStudyCategories = cats || [];

        const { data: logs, error: lErr } = await sb.from('daily_life_logs').select('*');
        if(lErr) throw lErr;
        cachedLifeLogs = logs || [];

        renderMainDashboard();
    } catch (err) {
        console.error("데이터 연동 장애: ", err.message);
    }
}
