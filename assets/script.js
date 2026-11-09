/* ================================================================
   videoshot — منطق مكالمات الفيديو (WebRTC + خادم إشارات Node.js)
   دعم ثنائية اللغة (العربية / الإنجليزية)
   ================================================================ */

(function () {
  'use strict';

  /* -------------------- الترجمات (i18n) -------------------- */
  const translations = {
    ar: {
      'brand.name': 'videoshot',
      'brand.tag': 'مكالمات فيديو عالية الجودة مباشرة عبر المتصفح',
      'landing.footer': 'لا يتطلب تسجيل دخول — يعمل على كروم، فايرفوكس، إيدج وسفاري.',
      'form.create.roomLabel': 'اسم الغرفة',
      'form.create.roomPlaceholder': 'مثال: غرفة-العائلة',
      'form.create.nameLabel': 'اسمك (اختياري)',
      'form.create.namePlaceholder': 'أحمد mercury',
      'form.create.createBtn': 'إنشاء مكالمة جديدة',
      'form.create.or': 'أو',
      'form.join.roomLabel': 'رمز الانضمام إلى الغرفة',
      'form.join.roomPlaceholder': 'أدخل رمز الغرفة',
      'form.join.nameLabel': 'اسمك (اختياري)',
      'form.join.namePlaceholder': 'أحمد mercury',
      'form.join.joinBtn': 'الانضمام إلى المكالمة',
      'features.p2p.title': 'اتصال مباشر (P2P)',
      'features.p2p.desc': 'تقنية WebRTC لنقل الفيديو والصوت بين المتصفحات مباشرة.',
      'features.screen.title': 'مشاركة الشاشة',
      'features.screen.desc': 'شارك شاشتك أو نافذة تطبيق مع المشاركين أثناء المكالمة.',
      'features.chat.title': 'دردشة فورية',
      'features.chat.desc': 'أرسل رسائل نصية للمشاركين خلال المكالمة دون مقاطعة الصوت.',
      'call.back': 'إنهاء المكالمة والعودة',
      'call.chat': 'فتح الدردشة',
      'call.info': 'معلومات الاتصال',
      'call.chatTitle': 'الدردشة',
      'call.chatPlaceholder': 'اكتب رسالة...',
      'call.chatSend': 'إرسال',
      'controls.camera': 'الكاميرا',
      'controls.cameraLabel': 'الكاميرا',
      'controls.mic': 'الميكروفون',
      'controls.micLabel': 'الميكروفون',
      'controls.screen': 'مشاركة الشاشة',
      'controls.screenLabel': 'الشاشة',
      'controls.hangup': 'إنهاء المكالمة',
      'controls.hangupLabel': 'إنهاء المكالمة',
      'controls.more': 'المزيد',
      'toast.cameraOn': 'تم تفعيل الكاميرا',
      'toast.cameraOff': 'تم إيقاف الكاميرا',
      'toast.micOn': 'تم تفعيل الميكروفون',
      'toast.micOff': 'تم كتم الميكروفون',
      'toast.screenOn': 'جارٍ مشاركة الشاشة',
      'toast.screenOff': 'تم إيقاف مشاركة الشاشة',
      'toast.screenFail': 'تعذر مشاركة الشاشة',
      'toast.mediaFail': 'تعذر الوصول للكاميرا أو الميكروفون. تأكد من منح الأذونات.',
      'toast.callEnded': 'تم إنهاء المكالمة',
      'toast.roomRequired': 'الرجاء إدخال رمز الغرفة',
      'participants': 'مشارك',
      'participantsPlural': 'مشاركين',
    },
    en: {
      'brand.name': 'videoshot',
      'brand.tag': 'High-quality video calls directly in the browser',
      'landing.footer': 'No sign-up required — works on Chrome, Firefox, Edge and Safari.',
      'form.create.roomLabel': 'Room name',
      'form.create.roomPlaceholder': 'e.g. family-room',
      'form.create.nameLabel': 'Your name (optional)',
      'form.create.namePlaceholder': 'Ahmed mercury',
      'form.create.createBtn': 'Create New Call',
      'form.create.or': 'or',
      'form.join.roomLabel': 'Room join code',
      'form.join.roomPlaceholder': 'Enter room code',
      'form.join.nameLabel': 'Your name (optional)',
      'form.join.namePlaceholder': 'Ahmed mercury',
      'form.join.joinBtn': 'Join Call',
      'features.p2p.title': 'Direct Connection (P2P)',
      'features.p2p.desc': 'WebRTC technology to transfer video and audio directly between browsers.',
      'features.screen.title': 'Screen Sharing',
      'features.screen.desc': 'Share your screen or an app window with participants during the call.',
      'features.chat.title': 'Instant Chat',
      'features.chat.desc': 'Send text messages to participants during the call without interrupting audio.',
      'call.back': 'End call and return',
      'call.chat': 'Open chat',
      'call.info': 'Connection info',
      'call.chatTitle': 'Chat',
      'call.chatPlaceholder': 'Type a message...',
      'call.chatSend': 'Send',
      'controls.camera': 'Camera',
      'controls.cameraLabel': 'Camera',
      'controls.mic': 'Microphone',
      'controls.micLabel': 'Microphone',
      'controls.screen': 'Screen sharing',
      'controls.screenLabel': 'Screen',
      'controls.hangup': 'End call',
      'controls.hangupLabel': 'End call',
      'controls.more': 'More',
      'toast.cameraOn': 'Camera enabled',
      'toast.cameraOff': 'Camera disabled',
      'toast.micOn': 'Microphone enabled',
      'toast.micOff': 'Microphone muted',
      'toast.screenOn': 'Screen sharing started',
      'toast.screenOff': 'Screen sharing stopped',
      'toast.screenFail': 'Failed to share screen',
      'toast.mediaFail': 'Unable to access camera or microphone. Please grant permissions.',
      'toast.callEnded': 'Call ended',
      'toast.roomRequired': 'Please enter a room code',
      'participants': 'participant',
      'participantsPlural': 'participants',
    },
  };

  let currentLang = 'ar';

  function setLang(lang) {
    currentLang = lang;
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // تحديث أزرار اللغة
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // تحديث النصوص حسب data-i18n
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const translation = translations[lang] && translations[lang][key];
      if (translation) el.textContent = translation;
    });

    // تحديث титуك (title) للعناصر ذات data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.dataset.i18nTitle;
      const translation = translations[lang] && translations[lang][key];
      if (translation) el.title = translation;
    });

    // تحديث placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      const translation = translations[lang] && translations[lang][key];
      if (translation) el.placeholder = translation;
    });

    // تحديث عنوان الصفحة
    document.title = lang === 'ar'
      ? 'videoshot | مكالمات فيديو احترافية عبر المتصفح'
      : 'videoshot | Professional Browser Video Calls';

    // تحديث إحصائيات المشاركين إن وُجدت
    updateParticipants();
  }

  /* -------------------- إعدادات -------------------- */
  const WS_URL = 'ws://localhost:3001'; // عدّل هذا عند النشر على خادم خارجي
  const STUN_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

  const myId = 'u_' + Math.random().toString(36).slice(2, 9);
  let myName = 'زائر';
  let roomId = '';
  let localStream = null;
  let screenStream = null;
  let isAudioOn = true;
  let isVideoOn = true;
  let isScreenOn = false;
  let callStart = 0;
  let timerInterval = null;
  let ws = null;

  const pcMap = new Map(); // peerId -> RTCPeerConnection
  const videoEls = new Map(); // peerId -> {wrap, video}

  /* -------------------- عناصر DOM -------------------- */
  const $ = (id) => document.getElementById(id);
  const pages = { landing: $('page-landing'), call: $('page-call') };

  const formStart = $('form-start');
  const formJoin = $('form-join');
  const inpRoom = $('room-name');
  const inpName = $('user-name');
  const inpRoomJoin = $('room-join');
  const inpNameJoin = $('user-name-join');

  const localVideoWrap = $('user-video-own');
  const videoGrid = $('video-grid');
  const timerEl = $('timer');
  const participantsEl = $('participants-count');
  const roomDisplay = $('room-id-display');

  const btnCamera = $('btn-camera');
  const btnMic = $('btn-mic');
  const btnScreen = $('btn-screen');
  const btnHangup = $('btn-hangup');
  const btnBack = $('btn-back');
  const btnChatToggle = $('btn-chat-toggle');
  const btnChatClose = $('btn-chat-close');
  const btnChatSend = $('btn-chat-send');
  const chatInput = $('chat-input');
  const chatMessages = $('chat-messages');
  const chatBadge = $('chat-badge');
  const chatSidebar = $('chat-sidebar');
  const toast = $('toast');

  let unreadChat = 0;

  /* -------------------- محدد اللغة -------------------- */
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setLang(btn.dataset.lang);
    });
  });

  /* -------------------- خادم الإشارات (WebSocket) -------------------- */
  function connectWS() {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('متصل بخادم الإشارات');
    };

    ws.onclose = () => {
      console.log('انقطع الاتصال بخادم الإشارات');
      ws = null;
    };

    ws.onmessage = (ev) => {
      let m;
      try { m = JSON.parse(ev.data); } catch (e) { return; }
      if (!m || m.room !== roomId) return;

      switch (m.type) {
        case 'joined':
          if (m.peers) {
            m.peers.forEach((p) => {
              if (!pcMap.has(p.id)) {
                createPeerConnection(p.id, true);
                setRemoteName(p.id, p.name);
              }
            });
          }
          updateParticipants();
          break;

        case 'peer-joined':
          if (!pcMap.has(m.from)) {
            createPeerConnection(m.from, true);
            setRemoteName(m.from, m.name);
          }
          updateParticipants();
          break;

        case 'peer-left':
          removePeer(m.from);
          break;

        case 'offer': {
          const pc = createPeerConnection(m.from, false);
          pc
            .setRemoteDescription(m.sdp)
            .then(() => pc.createAnswer())
            .then((answer) => pc.setLocalDescription(answer))
            .then(() => {
              sendSignal({ type: 'answer', to: m.from, sdp: pc.localDescription });
            })
            .catch((err) => console.error('فشل معالجة العرض:', err));
          break;
        }

        case 'answer': {
          const pc = pcMap.get(m.from);
          if (pc) {
            pc.setRemoteDescription(m.sdp).catch((err) =>
              console.error('فشل معالجة الرد:', err)
            );
          }
          break;
        }

        case 'candidate': {
          const pc = pcMap.get(m.from);
          if (pc && m.candidate) {
            pc
              .addIceCandidate(new RTCIceCandidate(m.candidate))
              .catch((err) => console.error('فشل إضافة مرشح ICE:', err));
          }
          break;
        }

        case 'chat':
          addChatMessage(m.from, m.name || 'مشارك', m.text, false);
          break;
      }
    };
  }

  function sendSignal(data) {
    const msg = { ...data, room: roomId };
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    } else {
      console.warn('اتصال الإشارات غير مفتوح، تم تجاهل:', data.type);
    }
  }

  /* -------------------- التنقل بين الصفحات -------------------- */
  function showPage(name) {
    Object.values(pages).forEach((p) => p.classList.remove('active'));
    pages[name].classList.add('active');
    document.body.style.overflow = name === 'call' ? 'hidden' : '';
  }

  function toastShow(msg, ms = 3000) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), ms);
  }

  /* -------------------- الوسائط المحلية -------------------- */
  async function initLocalMedia() {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      attachStream(localVideoWrap.querySelector('video'), localStream, true);
      updateToggleUI();
    } catch (err) {
      console.error('فشل الوصول للكاميرا والميكروفون:', err);
      toastShow(translations[currentLang]['toast.mediaFail']);
    }
  }

  function attachStream(el, stream, mirror = false) {
    if (!el) return;
    el.srcObject = stream;
    el.style.transform = mirror ? 'scaleX(-1)' : 'unset';
  }

  function stopTracks(stream) {
    if (!stream) return;
    stream.getTracks().forEach((t) => t.stop());
  }

  /* -------------------- المكالمات (WebRTC) -------------------- */
  function createPeerConnection(peerId, isInitiator) {
    const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });
    pcMap.set(peerId, pc);

    if (localStream) {
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    }

    pc.ontrack = (e) => {
      const [remoteStream] = e.streams;
      if (!remoteStream) return;
      addRemoteVideo(peerId, remoteStream);
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal({ type: 'candidate', to: peerId, candidate: e.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setTimeout(() => removePeer(peerId), 3000);
      }
    };

    if (isInitiator) {
      pc
        .createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          sendSignal({ type: 'offer', to: peerId, sdp: pc.localDescription });
        })
        .catch((err) => console.error('فشل إنشاء العرض:', err));
    }

    return pc;
  }

  function addRemoteVideo(peerId, stream) {
    if (videoEls.has(peerId)) {
      const el = videoEls.get(peerId).video;
      attachStream(el, stream, false);
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'video-wrap';
    wrap.id = `wrap-${peerId}`;

    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    attachStream(video, stream, false);

    const label = document.createElement('div');
    label.className = 'video-label';
    label.textContent = peerId.slice(0, 4) + '…';

    const status = document.createElement('div');
    status.className = 'video-status';
    status.innerHTML = `
      <span class="status-chip" title="متصل">● مباشر</span>
      <span class="status-chip" style="color:#cbd5e1">صوت وفيديو</span>
    `;

    wrap.appendChild(video);
    wrap.appendChild(label);
    wrap.appendChild(status);
    videoGrid.appendChild(wrap);

    videoEls.set(peerId, { wrap, video, stream });
    updateParticipants();
    reflowGrid();
  }

  function setRemoteName(peerId, name) {
    const entry = videoEls.get(peerId);
    if (!entry) return;
    entry.wrap.querySelector('.video-label').textContent = name || 'مشارك';
  }

  function removePeer(peerId) {
    const pc = pcMap.get(peerId);
    if (pc) {
      try { pc.close(); } catch (_) {}
      pcMap.delete(peerId);
    }
    const entry = videoEls.get(peerId);
    if (entry) {
      stopTracks(entry.stream);
      entry.wrap.remove();
      videoEls.delete(peerId);
    }
    updateParticipants();
    reflowGrid();
  }

  function reflowGrid() {
    const hasVideo = videoEls.size > 0;
    if (!localVideoWrap) return;
    if (hasVideo) {
      localVideoWrap.style.position = 'absolute';
      localVideoWrap.style.bottom = '1.1rem';
      localVideoWrap.style.left = '1rem';
      localVideoWrap.style.width = '160px';
      localVideoWrap.style.height = '90px';
      localVideoWrap.style.zIndex = '10';
    } else {
      localVideoWrap.style.position = 'static';
      localVideoWrap.style.width = '';
      localVideoWrap.style.height = '';
      localVideoWrap.style.zIndex = '';
    }
  }

  /* -------------------- إدارة المكالمة -------------------- */
  async function startCall(room, name) {
    roomId = room;
    myName = name || 'زائر';

    await initLocalMedia();
    connectWS();

    showPage('call');
    roomDisplay.textContent = room;
    callStart = Date.now();
    startTimer();
    updateParticipants();

    sendSignal({ type: 'join', name: myName });
  }

  function endCall() {
    sendSignal({ type: 'leave' });

    for (const [peerId, pc] of pcMap.entries()) {
      try { pc.close(); } catch (_) {}
      removePeer(peerId);
    }
    pcMap.clear();
    videoEls.clear();

    stopTracks(localStream);
    stopTracks(screenStream);
    localStream = null;
    screenStream = null;

    clearInterval(timerInterval);
    videoGrid.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = translations[currentLang] ? 'انتهت المكالمة' : 'Call ended';
    videoGrid.appendChild(empty);

    const ownVideo = localVideoWrap.querySelector('video');
    if (ownVideo) ownVideo.srcObject = null;

    showPage('landing');
    roomId = '';
    if (ws) {
      try { ws.close(); } catch (_) {}
      ws = null;
    }
    toastShow(translations[currentLang]['toast.callEnded']);
  }

  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const sec = Math.floor((Date.now() - callStart) / 1000);
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = (sec % 60).toString().padStart(2, '0');
      timerEl.textContent = `${m}:${s}`;
    }, 1000);
  }

  function updateParticipants() {
    const count = 1 + videoEls.size;
    const t = translations[currentLang];
    participantsEl.textContent = count + ' ' + (count > 1 ? t['participantsPlural'] : t['participants']);
  }

  /* -------------------- أزرار التحكم -------------------- */
  function updateToggleUI() {
    const videoTrack = localStream && localStream.getVideoTracks()[0];
    if (videoTrack) {
      btnCamera.classList.toggle('off', !videoTrack.enabled);
      btnCamera.querySelector('.ctrl-icon').textContent = videoTrack.enabled
        ? '📹'
        : '📹❌';
    }
    const audioTrack = localStream && localStream.getAudioTracks()[0];
    if (audioTrack) {
      btnMic.classList.toggle('off', !audioTrack.enabled);
      btnMic.querySelector('.ctrl-icon').textContent = audioTrack.enabled
        ? '🎤'
        : '🎤❌';
    }
  }

  async function toggleCamera() {
    if (!localStream) return;
    const track = localStream.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    updateToggleUI();
    toastShow(track.enabled ? translations[currentLang]['toast.cameraOn'] : translations[currentLang]['toast.cameraOff']);
  }

  async function toggleMic() {
    if (!localStream) return;
    const track = localStream.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    updateToggleUI();
    toastShow(track.enabled ? translations[currentLang]['toast.micOn'] : translations[currentLang]['toast.micOff']);
  }

  async function toggleScreen() {
    if (!localStream) return;

    if (isScreenOn) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        for (const [, pc] of pcMap.entries()) {
          const sender = pc
            .getSenders()
            .find((s) => s.track && s.track.kind === 'video');
          if (sender) {
            try { await sender.replaceTrack(videoTrack); } catch (_) {}
          }
        }
        attachStream(localVideoWrap.querySelector('video'), localStream, true);
      }
      stopTracks(screenStream);
      screenStream = null;
      isScreenOn = false;
      btnScreen.classList.remove('off');
      btnScreen.querySelector('.ctrl-icon').textContent = '🖥️';
      toastShow(translations[currentLang]['toast.screenOff']);
      return;
    }

    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      for (const [, pc] of pcMap.entries()) {
        const sender = pc
          .getSenders()
          .find((s) => s.track && s.track.kind === 'video');
        if (sender) {
          try { await sender.replaceTrack(screenTrack); } catch (_) {}
        }
      }
      attachStream(localVideoWrap.querySelector('video'), screenStream, true);
      isScreenOn = true;
      btnScreen.classList.add('off');
      btnScreen.querySelector('.ctrl-icon').textContent = '🖥️✅';
      toastShow(translations[currentLang]['toast.screenOn']);

      screenStream.getVideoTracks()[0].onended = () => {
        isScreenOn = false;
        btnScreen.classList.remove('off');
        btnScreen.querySelector('.ctrl-icon').textContent = '🖥️';
      };
    } catch (err) {
      console.error('فشل مشاركة الشاشة:', err);
      toastShow(translations[currentLang]['toast.screenFail']);
    }
  }

  /* -------------------- الدردشة -------------------- */
  function addChatMessage(fromId, name, text, isOwn = false, scroll = true) {
    const div = document.createElement('div');
    div.className = 'msg ' + (isOwn ? 'msg-own' : 'msg-other');
    const meta = document.createElement('div');
    meta.className = 'msg-meta';
    meta.textContent = name + ' · الآن';
    div.appendChild(meta);
    const body = document.createElement('div');
    body.textContent = text;
    div.appendChild(body);
    chatMessages.appendChild(div);
    if (scroll) chatMessages.scrollTop = chatMessages.scrollHeight;
    if (!isOwn && !document.hasFocus()) {
      unreadChat++;
      chatBadge.textContent = unreadChat;
      chatBadge.classList.remove('hidden');
    }
  }

  async function sendChat() {
    const text = chatInput.value.trim();
    if (!text) return;
    addChatMessage(myId, myName, text, true);
    sendSignal({ type: 'chat', text });
    chatInput.value = '';
  }

  function toggleChat() {
    const hidden = chatSidebar.classList.toggle('hidden');
    if (!hidden) {
      unreadChat = 0;
      chatBadge.classList.add('hidden');
      chatMessages.scrollTop = chatMessages.scrollHeight;
      chatInput.focus();
    }
  }

  /* -------------------- معالجات الأحداث -------------------- */
  formStart.addEventListener('submit', async (e) => {
    e.preventDefault();
    const room = inpRoom.value.trim() || 'room-' + Math.random().toString(36).slice(2, 6);
    const name = inpName.value.trim();
    await startCall(room, name);
  });

  formJoin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const room = inpRoomJoin.value.trim();
    const name = inpNameJoin.value.trim();
    if (!room) {
      toastShow(translations[currentLang]['toast.roomRequired']);
      return;
    }
    await startCall(room, name);
  });

  btnCamera.addEventListener('click', toggleCamera);
  btnMic.addEventListener('click', toggleMic);
  btnScreen.addEventListener('click', toggleScreen);
  btnHangup.addEventListener('click', endCall);
  btnBack.addEventListener('click', endCall);

  btnChatToggle.addEventListener('click', toggleChat);
  btnChatClose.addEventListener('click', toggleChat);
  btnChatSend.addEventListener('click', sendChat);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChat();
  });

  window.addEventListener('beforeunload', () => {
    if (roomId) sendSignal({ type: 'leave' });
    stopTracks(localStream);
    stopTracks(screenStream);
    for (const pc of pcMap.values()) {
      try { pc.close(); } catch (_) {}
    }
    if (ws) ws.close();
  });

  /* -------------------- بدء التطبيق -------------------- */
  // تطبيق اللغة المحفوظة أو الافتراضية (العربية)
  const savedLang = localStorage.getItem('videoshot_lang');
  if (savedLang && translations[savedLang]) {
    setLang(savedLang);
  } else {
    setLang('ar');
  }

  const empty = document.createElement('div');
  empty.className = 'empty-state';
  empty.textContent = translations[currentLang] ? 'ابدأ أو انضم إلى مكالمة' : 'Start or join a call';
  videoGrid.appendChild(empty);

  console.log('videoshot جاهز — المعرف:', myId);
})();
