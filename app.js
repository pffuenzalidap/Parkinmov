document.addEventListener('DOMContentLoaded', () => {
      lucide.createIcons();
      startHeroCarousel();
    });

    // --- NAVEGACIÓN SPA ---
    function navTo(viewId) {
      document.querySelectorAll('main > div').forEach(el => el.className = 'hidden-section');
      const target = document.getElementById(`section-${viewId}`);
      if(target) { target.className = 'active-section'; }
      window.scrollTo(0,0);
    }

    // --- NAVEGACIÓN SCROLL SUAVE ---
    function scrollToSection(id) {
      navTo('landing'); // Asegura estar en la vista correcta
      setTimeout(() => {
        const el = document.getElementById(id);
        if(el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({top: y, behavior: 'smooth'});
        }
      }, 100);
    }

    // --- MANEJO DE MODALES ---
    function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
    function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
    
    function showAlert(title, msg) {
      document.getElementById('alertTitle').innerText = title;
      document.getElementById('alertMsg').innerText = msg;
      openModal('alertModal');
    }

    // --- CAROUSEL HERO (KEN BURNS) ---
    let currentSlide = 1;
    function startHeroCarousel() {
      setInterval(() => {
        document.getElementById(`slide-${currentSlide}`).classList.remove('active');
        currentSlide = currentSlide >= 3 ? 1 : currentSlide + 1;
        document.getElementById(`slide-${currentSlide}`).classList.add('active');
      }, 6000);
    }

    // --- CARRUSEL TESTIMONIOS ---
    function changeTesti(num) {
      document.getElementById('testi-1').className = `testi-slide absolute inset-0 ${num===1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`;
      document.getElementById('testi-2').className = `testi-slide absolute inset-0 ${num===2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`;
    }

    // --- FLUJO TRIAGE CLÍNICO ---
    let tStep = 1;
    function triageNext() {
      if(tStep === 2) {
        // Analizar y mostrar resultado
        const riesgo = document.querySelector('input[name="tSeguridad"]:checked').value;
        const resultText = document.getElementById('tResultText');
        if(riesgo === 'riesgo') {
          resultText.innerHTML = "Por seguridad ante riesgo de caídas, recomendamos <strong>Visita a Domicilio</strong>.";
        } else {
          resultText.innerHTML = "Excelente nivel de independencia. El <strong>Tele-Rehab PRO</strong> es ideal para ti.";
        }
        document.getElementById('tFooter').classList.add('hidden');
      }
      tStep++;
      updateTriageUI();
    }
    
    function triagePrev() {
      tStep--;
      updateTriageUI();
    }

    function updateTriageUI() {
      [1,2,3].forEach(s => {
        const el = document.getElementById(`tStep${s}`);
        if(el) el.style.display = (s === tStep) ? 'block' : 'none';
      });
      document.getElementById('triageProgress').style.width = `${(tStep/3)*100}%`;
      document.getElementById('tBtnPrev').style.display = tStep > 1 ? 'block' : 'none';
    }

    function closeTriageAndScroll() {
      closeModal('triageModal');
      tStep = 1; updateTriageUI(); document.getElementById('tFooter').classList.remove('hidden');
      scrollToSection('planes');
    }

    // --- FLUJO CALENDARIO DOMICILIO ---
    let selectedDateInfo = "";
    function selectDate(btn, date) {
      document.querySelectorAll('.cal-btn').forEach(el => {
        el.classList.remove('border-brand-500', 'bg-brand-50', 'text-brand-700');
      });
      btn.classList.add('border-brand-500', 'bg-brand-50', 'text-brand-700');
      
      document.getElementById('calTimes').innerHTML = `
        <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 mb-2">
          <input type="radio" name="cTime" value="09:00 - Klgo. Rodrigo" onchange="enableCalBtn('${date}', this.value)" class="w-4 h-4">
          <span class="font-bold text-slate-800 text-sm">09:00 AM (Klgo. Rodrigo)</span>
        </label>
        <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
          <input type="radio" name="cTime" value="11:30 - Klga. Camila" onchange="enableCalBtn('${date}', this.value)" class="w-4 h-4">
          <span class="font-bold text-slate-800 text-sm">11:30 AM (Klga. Camila)</span>
        </label>
      `;
      document.getElementById('btnConfirmDate').className = "bg-slate-200 text-slate-400 font-bold px-6 py-2.5 rounded-xl transition";
      document.getElementById('btnConfirmDate').disabled = true;
    }

    function enableCalBtn(date, time) {
      selectedDateInfo = `${date} a las ${time}`;
      const btn = document.getElementById('btnConfirmDate');
      btn.disabled = false;
      btn.className = "bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md";
    }

    function confirmDate() {
      closeModal('calendarModal');
      goToCheckout('Visita a Domicilio', 35000, `Reserva pre-agendada: ${selectedDateInfo}.`);
      document.getElementById('checkoutTimerBox').classList.remove('hidden');
      startTimer(600); // 10 min
    }

    // --- CHECKOUT & WEBPAY ---
    let timerInterval;
    function goToCheckout(name, price, details = 'Activación inmediata de cuenta digital.') {
      document.getElementById('chkPlanName').innerText = name;
      document.getElementById('chkPlanPrice').innerText = `$${price.toLocaleString('es-CL')}`;
      document.getElementById('chkPlanDetails').innerText = details;
      
      document.getElementById('checkoutTimerBox').classList.add('hidden');
      clearInterval(timerInterval);
      navTo('checkout');
    }

    function startTimer(duration) {
      let timer = duration;
      const display = document.getElementById('checkoutTimer');
      timerInterval = setInterval(() => {
        let m = parseInt(timer / 60, 10);
        let s = parseInt(timer % 60, 10);
        display.textContent = (m<10?"0"+m:m) + ":" + (s<10?"0"+s:s);
        if (--timer < 0) {
          clearInterval(timerInterval);
          showAlert('Tiempo Expirado', 'La hora reservada ha vuelto a estar disponible para otros pacientes.');
          navTo('landing');
        }
      }, 1000);
    }

    function simulatePayment() {
      const btn = document.getElementById('btnWebpay');
      const oldHTML = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Conectando banco...`;
      btn.disabled = true;
      lucide.createIcons();

      setTimeout(() => {
        clearInterval(timerInterval);
        btn.innerHTML = oldHTML;
        btn.disabled = false;
        navTo('portal');
      }, 3000);
    }