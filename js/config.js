// Supabase 설정 + 오늘 날짜 baseline
// ⚠️ [중요] 자신의 실제 Supabase 프로젝트 API 키셋으로 치환하세요.
const SUPABASE_URL = "https://cuuhrquajxdotyakhnoc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1dWhycXVhanhkb3R5YWtobm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNjQxNzUsImV4cCI6MjA5NDY0MDE3NX0.OsJjaT1RtUMtgG0Za8kRzrEHpWBnPurAK7mvWy5s3KU";

const sb = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const TODAY_BASE_STR = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
})();
