// 피트니스 & 식단 탭 (체중 차트 포함)
function loadDietTabAnalysis() {
    const summaryBox = document.getElementById('diet-weekly-summary-list');
    summaryBox.innerHTML = "";

    const days = getMonthDaysInfo(viewYear, viewMonth);
    const startIdx = (currentSelectedWeekNum - 1) * 7;
    const targetWeekDays = days.slice(startIdx, startIdx + 7);

    targetWeekDays.forEach(day => {
        const log = cachedLifeLogs.find(l => l.user_id === currentActiveUserId && l.log_date === day.fullDateStr);
        const meals = log && log.meals ? log.meals : { morning: "", lunch: "", dinner: "" };
        const am = log ? log.diet_am_w : null;
        const pm = log ? log.diet_pm_w : null;

        const card = document.createElement('div');
        card.className = "p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left font-bold space-y-1";
        card.innerHTML = `
            <div class="text-slate-800 font-black border-b pb-1 text-[11px]">${day.fullDateStr} 요약 보드</div>
            <div class="text-slate-600">🥗 식사 현황: 아침[${meals.morning || '공백'}] | 점심[${meals.lunch || '공백'}] | 저녁[${meals.dinner || '공백'}]</div>
            <div class="text-theme-orange">⚖️ 체중 변화: 오전[${am ? am + 'kg' : '-'}] ➡️ 오후[${pm ? pm + 'kg' : '-'}]</div>
        `;
        summaryBox.appendChild(card);
    });

    buildWeightLineChart();
}

function buildWeightLineChart() {
    const ctx = document.getElementById('dietWeightChart').getContext('2d');
    if(globalWeightChartInstance) globalWeightChartInstance.destroy();

    // 유저 데이터를 날짜 순 정렬하여 차트 데이터 매핑
    const myLogs = cachedLifeLogs.filter(l => l.user_id === currentActiveUserId).sort((a,b) => new Date(a.log_date) - new Date(b.log_date));
    const labels = myLogs.map(l => l.log_date.slice(5));
    const amWeights = myLogs.map(l => l.diet_am_w);

    globalWeightChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : ['기록없음'],
            datasets: [{
                label: '오전 공복체중(kg)',
                data: amWeights.length > 0 ? amWeights : [0],
                borderColor: '#f26631',
                backgroundColor: 'rgba(242,102,49,0.1)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: false } }
        }
    });
}
