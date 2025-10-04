function showToast(message, isError = false) {
    const toast = document.getElementById("submit-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast-popup show';
    if (isError) {
        toast.classList.add('error');
    }
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/**
 * 달력을 생성하는 함수
 */
function generateCalendar(year, month) {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;
    const date = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0).getDate();
    const firstDayIndex = date.getDay();
    let calendarHTML = '<table><thead><tr>';
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    days.forEach(day => calendarHTML += `<th>${day}</th>`);
    calendarHTML += '</tr></thead><tbody>';
    let dayCounter = 1;
    for (let i = 0; i < 6; i++) {
        calendarHTML += '<tr>';
        for (let j = 0; j < 7; j++) {
            if ((i === 0 && j < firstDayIndex) || dayCounter > lastDay) {
                calendarHTML += '<td></td>';
            } else {
                let cellClass = (dayCounter === 8) ? ' class="wedding-day"' : '';
                calendarHTML += `<td${cellClass}><div>${dayCounter}</div></td>`;
                dayCounter++;
            }
        }
        calendarHTML += '</tr>';
        if (dayCounter > lastDay) break;
    }
    calendarHTML += '</tbody></table>';
    calendarEl.innerHTML = calendarHTML;
}

// HTML 문서가 완전히 로드되면 아래 코드들을 실행
document.addEventListener("DOMContentLoaded", function() {
    
    generateCalendar(2025, 11);

    // [수정] 카카오맵 API 초기화 코드
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        // 카카오 API가 로드될 때까지 잠시 기다렸다가 실행
        setTimeout(function() {
            if (typeof kakao !== "undefined" && kakao.maps) {
                kakao.maps.load(function() {
                    const mapOption = { 
                        center: new kakao.maps.LatLng(37.582867, 127.05767),
                        level: 3 
                    };
                    const map = new kakao.maps.Map(mapContainer, mapOption);
                    const markerPosition  = new kakao.maps.LatLng(37.582867, 127.05767); 
                    const marker = new kakao.maps.Marker({ position: markerPosition });
                    marker.setMap(map);
                    const iwContent = '<div style="padding:5px; text-align:center; font-size:14px; min-width:150px;">서울시립대 자작마루</div>';
                    const infowindow = new kakao.maps.InfoWindow({ content: iwContent });
                    infowindow.open(map, marker);
                });
            } else {
                mapContainer.innerHTML = "지도를 불러오는 데 실패했습니다. API 키와 도메인 설정을 확인해주세요.";
            }
        }, 100); // 0.1초 대기
    }

    // 계좌번호 토글 기능
    const accountBtns = document.querySelectorAll(".account-btn");
    accountBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            const targetDiv = document.getElementById(this.dataset.target);
            targetDiv.style.display = (targetDiv.style.display === "block") ? "none" : "block";
        });
    });

    // 클립보드 복사 기능
    if (typeof ClipboardJS !== "undefined") {
        new ClipboardJS('.copy-btn').on('success', (e) => {
            showToast("계좌번호가 복사되었습니다.");
            e.clearSelection();
        });
    }

    // 전세버스 인원 입력칸 토글
    document.querySelectorAll('input[name="bus_choice"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const countWrapper = document.getElementById('bus-count-wrapper');
            const isBusSelected = (this.value !== '해당 없음');
            countWrapper.classList.toggle('hidden', !isBusSelected);
            if (isBusSelected) {
                const busGuestsInput = document.getElementById('bus-guests');
                if (!busGuestsInput.value || parseInt(busGuestsInput.value) === 0) {
                    busGuestsInput.value = "1";
                }
            }
        });
    });

    // RSVP 폼 제출
    const rsvpForm = document.getElementById('rsvp-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const form = event.target;
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = '전송 중...';

            fetch(form.action, {
                method: form.method,
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    showToast("참석 의사를 전달해주셔서 감사합니다!");
                    form.reset();
                    document.getElementById('bus-count-wrapper').classList.add('hidden');
                } else {
                    response.json().then(data => {
                        const errorMessage = data.errors ? data.errors.map(e => e.message).join(', ') : "전송에 실패했습니다.";
                        showToast(errorMessage, true);
                    });
                }
            }).catch(() => showToast("네트워크 오류가 발생했습니다.", true))
              .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = '참석 의사 보내기';
            });
        });
    }

    // 스크롤 애니메이션
    const animationTargets = document.querySelectorAll('.scroll-animate');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    animationTargets.forEach(target => observer.observe(target));
});
