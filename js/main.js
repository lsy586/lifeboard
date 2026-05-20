// 앱 엔트리: DOMContentLoaded
window.addEventListener('DOMContentLoaded', async () => {
    if (!sb) {
        alert("Supabase 클라이언트 초기화에 실패했습니다. 라이브러리 및 설정을 확인하세요.");
        return;
    }
    await refreshAllServerData();
    document.getElementById('input-tab-etc-date').value = TODAY_BASE_STR;
    document.getElementById('input-tab-acc-date').value = TODAY_BASE_STR;
});
