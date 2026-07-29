// translations.js — Localization strings for English, Hindi, and 19 other languages

export const translations = {
  en: {
    // Lobby & Settings
    SETTINGS: "SETTINGS",
    CONTROLS: "CONTROLS",
    CTRL_CLASSIC: "Classic",
    CTRL_HOLD_FIRE: "Hold-Fire",
    SENSITIVITY: "SENSITIVITY",
    MUSIC: "MUSIC",
    SFX: "SFX",
    LANGUAGE: "LANGUAGE",
    CLOSE: "CLOSE",
    START: "START",
    GO_TO_LOBBY: "GO TO LOBBY",
    HIGHSCORE: "HIGHSCORE",
    MAX_KILLS: "MAX KILLS",
    WELCOME_BACK: "Welcome Back",
    PLAYER: "PLAYER",

    // HUD - Game
    HEALTH: "HEALTH",
    AMMO: "AMMO",
    SCORE: "SCORE",
    KILLS: "KILLS",
    WAVE: "WAVE",
    COMBO: "COMBO",

    // Game Over Screen
    GAME_OVER: "GAME OVER",
    YOU_DIED: "YOU DIED!",
    YOU_SURVIVED: "YOU SURVIVED!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "RIFLE KILLS",
    SNIPER_KILLS: "SNIPER KILLS",

    // Rewarded Ad Popup
    RA_TITLE: "CONTINUE?",
    RA_MESSAGE: "Watch an ad to restore health and continue playing!",
    RA_WATCH_AD: "WATCH AD",
    RA_NO_THANKS: "NO THANKS",
    RA_HP_TEXT: "+100 HP",
    RA_AMMO_TITLE: "CONTINUE?",
    RA_AMMO_MESSAGE: "Watch an ad to refill ammo and continue playing!",
    RA_AMMO_TEXT: "FULL AMMO",

    // Collectable Types
    MED_KIT: "MED KIT",
    RIFLE_AMMO: "RIFLE AMMO",
    SNIPER_AMMO: "SNIPER AMMO",
    GRENADE: "GRENADE",
    FULL_HP: "(FULL HP)",
    FULL_AMMO: "(FULL)",
    HP_SHORT: "HP",

    // Kill Types
    HEADSHOT: "HEADSHOT",
    BODYSHOT: "BODYSHOT",
    KILLSTREAK: "KILLSTREAK",

    // Tips & Messages
    TIP: "TIP",
    KEEP_MOVING: "KEEP MOVING AND USE COVER TO STAY ALIVE!",
    AIM_FOR_HEAD: "AIM FOR THE HEAD FOR BONUS DAMAGE!",
    RELOAD_EARLY: "RELOAD BEFORE YOU NEED TO — NOT DURING A FIGHT!",
    USE_COVER: "USE COVER TO PEEK AND SHOOT — STAY HIDDEN!",
    COMBO_BONUS: "HIGHER COMBO = BIGGER SCORE BONUS!",
    ELIMINATE_ENEMIES: "ELIMINATE ALL ENEMIES TO ADVANCE TO THE NEXT WAVE!",
    GET_READY: "GET READY!",
    SURVIVE_STREETS: "SURVIVE THE STREET! STAND AS LONG AS YOU CAN!",
    LOADING: "LOADING...",
    LOADING_ASSETS: "Loading assets…",

    // In-game Feedback
    AMMO_OUT: "OUT OF AMMO!",
    WAVE_CLEAR: "WAVE CLEARED!",
    WAVE_COMPLETE: "WAVE COMPLETE",

    // Player Name
    ENTER_NAME: "ENTER YOUR NAME",
    TYPE_NAME: "Type name",
    SAVE: "SAVE",
    EDIT_NAME: "Edit player name",

    // Lobby labels
    WELCOME_BACK: "Welcome Back",

    // Game Over
    GO_TO_LOBBY: "GO TO LOBBY",
    SCORE: "SCORE",

    // Kill feedback
    HEADSHOT: "HEADSHOT!",
    BODYSHOT: "BODY SHOT",
    KILLSTREAK: "KILLSTREAK",

    // Tutorial
    TUT_CAMERA_TITLE: "Camera Aim",
    TUT_CAMERA_DESC:
      "Drag the screen to see near enemies",
    TUT_CAMERA_TITLE2: "Camera Aim",
    TUT_CAMERA_DESC2: "Move your mouse to aim your camera on the enemies",
    TUT_ADS_TITLE: "Scope Aim",
    TUT_ADS_DESC:
      "Tap the SCOPE button on the left to scope in and aim precisely",
    TUT_ADS_TITLE2: "Precision Aim",
    TUT_ADS_DESC2: "Press and hold the RIGHT click button to scope in and aim precisely.",
    TUT_ADS_FIRE_TITLE: "Fire!",
    TUT_ADS_FIRE_DESC: "Adjust the camera and tap fire to shoot",
    TUT_ADS_FIRE_TITLE2: "Fire!",
    TUT_ADS_FIRE_DESC2: "Click LEFT button to fire!",
    TUT_JOYSTICK_AIM_TITLE: "Hold to Aim",
    TUT_JOYSTICK_AIM_DESC: "Hold the fire button to scope in and aim precisely!",
    TUT_JOYSTICK_FIRE_TITLE: "Release to Fire!",
    TUT_JOYSTICK_FIRE_DESC: "Release the fire button to shoot the enemy!",
    TUT_GUN_SWITCH_TITLE: "Switch Weapon",
    TUT_GUN_SWITCH_DESC: "Tap the weapon switch button to change weapons",
    TUT_GUN_SWITCH_TITLE2: "Switch Weapon",
    TUT_GUN_SWITCH_DESC2:
      "Press TAB or numbers 1 or 2 or scroll your mouse wheel to change weapon",
    TUT_ELIMINATE_ALL_TITLE: "Eliminate All",
    TUT_ELIMINATE_ALL_DESC:
      "Enemies only hit you while you are scoped in or when you miss your shot",
    TUT_ELIMINATE_ALL_TITLE2: "Eliminate All",
    TUT_ELIMINATE_ALL_DESC2:
      "Enemies only hit you while you are scoped in or when you miss your shot",
    TUT_GRENADE_COLLECTED_TITLE: "Grenade Collected!",
    TUT_GRENADE_COLLECTED_DESC:
      "You collected a GRENADE! It could be Medkit or Ammo as well. Tap to continue",
    TUT_GRENADE_COLLECTED_TITLE2: "Grenade Collected!",
    TUT_GRENADE_COLLECTED_DESC2:
      "You collected a GRENADE! It could be Medkit or Ammo as well. Click to continue",
    TUT_GRENADE_EQUIP_TITLE: "Equip Grenade",
    TUT_GRENADE_EQUIP_DESC: "Tap the GRENADE icon to equip it in your hand",
    TUT_GRENADE_EQUIP_TITLE2: "Equip Grenade",
    TUT_GRENADE_EQUIP_DESC2:
      "Press G key or scroll mouse wheel to equip grenade in your hand",
    TUT_GRENADE_AIM_TITLE: "Aim Grenade",
    TUT_GRENADE_AIM_DESC:
      "Tap the SCOPE button to aim the grenade trajectory",
    TUT_GRENADE_AIM_TITLE2: "Aim Grenade",
    TUT_GRENADE_AIM_DESC2: "Press and hold the RIGHT click button to aim the grenade trajectory!",
    TUT_GRENADE_THROW_TITLE: "Throw Grenade",
    TUT_GRENADE_THROW_DESC: "Tap the FIRE button to throw the grenade!",
    TUT_GRENADE_THROW_TITLE2: "Throw Grenade",
    TUT_GRENADE_THROW_DESC2: "Click LEFT mouse button to throw the grenade!",
    TUT_GRENADE_ELIMINATE_TITLE: "Eliminate All",
    TUT_GRENADE_ELIMINATE_DESC: "Eliminate all remaining enemies!",
    TUT_GRENADE_ELIMINATE_TITLE2: "Eliminate All",
    TUT_GRENADE_ELIMINATE_DESC2: "Eliminate all remaining enemies!",
    TUT_SCORE_TITLE: "Score & Kills",
    TUT_SCORE_DESC:
      "That's it! You can track your SCORE and KILLS here! Tap anywhere to continue playing",
    TUT_SCORE_TITLE2: "Score & Kills",
    TUT_SCORE_DESC2:
      "That's it! You can track your SCORE and KILLS here! Click anywhere to continue playing",

    // Store
    STORE_TITLE: "STORE",
    STORE_GUNS: "GUNS",
    STORE_POWERUPS: "POWER-UPS",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "SHOTGUN",
    STORE_ROCKET_LAUNCHER: "ROCKET LAUNCHER",
    STORE_GRENADE: "GRENADE",
    STORE_AMMO_PACK: "AMMO PACK",
    STORE_AK47: "AK47",
    STORE_SNIPER: "SNIPER",
    STORE_SELECT_AN_ITEM: "SELECT AN ITEM",
    STORE_CHOOSE_LIST: "Choose from the list",
    STORE_DRAG_ROTATE: "Drag to rotate",
    STORE_PRIMARY_WEAPON: "Primary Weapon",
    STORE_POWERUP_SUB: "Power-Up",
    STORE_PURCHASED: "purchased",
    STORE_BUY: "BUY",
    STORE_OWNED: "OWNED",
    STORE_MAX_LIMIT: "MAX LIMIT",
    STORE_CLOSE: "CLOSE",
    STORE_NOT_ENOUGH_CASH: "NOT ENOUGH CASH!",
    STORE_PURCHASE_AGAIN: "You can purchase it again next round!",

    // Weapon Names
    RIFLE: "RIFLE",
    SNIPER: "SNIPER",

    // Weapon Select Popup
    SELECT_WEAPONS_TITLE: "SELECT WEAPONS",
    SELECT_CONTINUE: "CONTINUE",

    // Additional UI
    ON: "ON",
    OFF: "OFF",
    TIP_LABEL: "TIP:",
    NEXT_WAVE: "NEXT WAVE",
    PLAYER_NAME_TITLE: "PLAYER NAME",
  },

  hi: {
    // Lobby & Settings
    SETTINGS: "सेटिंग्स",
    CONTROLS: "नियंत्रण",
    CTRL_CLASSIC: "क्लासिक",
    CTRL_HOLD_FIRE: "होल्ड-फायर",
    SENSITIVITY: "संवेदनशीलता",
    MUSIC: "संगीत",
    SFX: "ध्वनि प्रभाव",
    LANGUAGE: "भाषा",
    CLOSE: "बंद करें",
    START: "शुरू करें",
    GO_TO_LOBBY: "लॉबी में जाएं",
    HIGHSCORE: "उच्चतम स्कोर",
    MAX_KILLS: "अधिकतम किल्स",
    WELCOME_BACK: "वापसी पर स्वागत है",
    PLAYER: "खिलाड़ी",

    // HUD - Game
    HEALTH: "स्वास्थ्य",
    AMMO: "गोलाबारी",
    SCORE: "स्कोर",
    KILLS: "किल्स",
    WAVE: "लहर",
    COMBO: "कॉम्बो",

    // Game Over Screen
    GAME_OVER: "खेल समाप्त",
    YOU_DIED: "आप मर गए!",
    YOU_SURVIVED: "आप बच गए!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "राइफल किल्स",
    SNIPER_KILLS: "स्नाइपर किल्स",

    // Rewarded Ad Popup
    RA_TITLE: "जारी रखें?",
    RA_MESSAGE: "स्वास्थ्य बहाल करने और खेलना जारी रखने के लिए एक विज्ञापन देखें!",
    RA_WATCH_AD: "विज्ञापन देखें",
    RA_NO_THANKS: "नहीं, धन्यवाद",
    RA_HP_TEXT: "+100 HP",

    // Collectable Types
    MED_KIT: "मेड किट",
    RIFLE_AMMO: "राइफल गोलाबारी",
    SNIPER_AMMO: "स्नाइपर गोलाबारी",
    GRENADE: "ग्रेनेड",
    FULL_HP: "(पूर्ण स्वास्थ्य)",
    FULL_AMMO: "(पूर्ण)",
    HP_SHORT: "स्वास्थ्य",

    // Kill Types
    HEADSHOT: "सिरदर्द",
    BODYSHOT: "शरीर पर वार",
    KILLSTREAK: "किल स्ट्रीक",

    // Tips & Messages
    TIP: "सुझाव",
    KEEP_MOVING: "चलते रहें और कवर का उपयोग करके जीवित रहें!",
    AIM_FOR_HEAD: "सिर के लिए लक्ष्य करें अतिरिक्त नुकसान के लिए!",
    RELOAD_EARLY: "जरूरत से पहले रीलोड करें - लड़ाई के दौरान नहीं!",
    USE_COVER: "कवर का उपयोग करके झांकें और गोली चलाएं - छिपे रहें!",
    COMBO_BONUS: "उच्च कॉम्बो = बड़ा स्कोर बोनस!",
    ELIMINATE_ENEMIES:
      "अगली लहर में आगे बढ़ने के लिए सभी दुश्मनों को खत्म करें!",
    GET_READY: "तैयार हो जाओ!",
    SURVIVE_STREETS: "सड़कों पर जीवित रहें जितना लंबा हो सके!",
    LOADING: "लोड हो रहा है...",
    LOADING_ASSETS: "एसेट लोड हो रहे हैं…",

    // In-game Feedback
    AMMO_OUT: "गोलाबारी खत्म!",
    WAVE_CLEAR: "लहर साफ़!",
    WAVE_COMPLETE: "लहर पूर्ण",

    // Player Name
    ENTER_NAME: "अपना नाम दर्ज करें",
    TYPE_NAME: "नाम लिखें",
    SAVE: "सहेजें",
    EDIT_NAME: "खिलाड़ी का नाम संपादित करें",

    // Lobby labels
    WELCOME_BACK: "वापसी पर स्वागत है",

    // Game Over
    GO_TO_LOBBY: "लॉबी में जाएं",
    SCORE: "स्कोर",

    // Kill feedback
    HEADSHOT: "HEADशॉट!",
    BODYSHOT: "बॉडी शॉट",
    KILLSTREAK: "किल स्ट्रीक",

    // Tutorial
    TUT_CAMERA_TITLE: "कैमरा निशाना",
    TUT_CAMERA_DESC:
      "आस-पास के दुश्मनों को देखने के लिए स्क्रीन को ड्रैग करें",
    TUT_CAMERA_TITLE2: "कैमरा निशाना",
    TUT_CAMERA_DESC2:
      "दुश्मनों पर अपना कैमरा लक्षित करने के लिए अपना माउस घुमाएं",
    TUT_ADS_TITLE: "स्कोप निशाना",
    TUT_ADS_DESC:"स्कोप इन करने और सटीक निशाना लगाने के लिए बाईं ओर दिए गए स्कोप (SCOPE) बटन पर टैप करें",
    TUT_ADS_TITLE2: "सटीक निशाना",
    TUT_ADS_DESC2: "स्कोप इन करने और सटीक निशाना लगाने के लिए राइट क्लिक बटन दबाकर रखें।",
    TUT_ADS_FIRE_TITLE: "फायर करें!",
    TUT_ADS_FIRE_DESC: "कैमरा समायोजित करें और शूट करने के लिए फायर पर टैप करें",
    TUT_ADS_FIRE_TITLE2: "फायर करें!",
    TUT_ADS_FIRE_DESC2: "फायर करने के लिए लेफ्ट बटन पर क्लिक करें!",
    TUT_JOYSTICK_AIM_TITLE: "निशाना लगाने के लिए दबाए रखें",
    TUT_JOYSTICK_AIM_DESC: "स्कोप में देखने और सटीक निशाना लगाने के लिए फायर बटन को दबाए रखें!",
    TUT_JOYSTICK_FIRE_TITLE: "फायर करने के लिए छोड़ें!",
    TUT_JOYSTICK_FIRE_DESC: "दुश्मन पर गोली चलाने के लिए फायर बटन को छोड़ें!",
    TUT_GUN_SWITCH_TITLE: "हथियार बदलें",
    TUT_GUN_SWITCH_DESC: "हथियार बदलने के लिए वेपन स्विच बटन पर टैप करें",
    TUT_GUN_SWITCH_TITLE2: "हथियार बदलें",
    TUT_GUN_SWITCH_DESC2:
      "हथियार बदलने के लिए TAB या नंबर 1 या 2 दबाएं या अपने माउस व्हील को स्क्रॉल करें",
    TUT_ELIMINATE_ALL_TITLE: "सभी को खत्म करें",
    TUT_ELIMINATE_ALL_DESC:
      "दुश्मन आपको केवल तभी मार सकते हैं जब आप स्कोप इन किए हुए हों या जब आप अपना शॉट मिस कर देते हैं",
    TUT_ELIMINATE_ALL_TITLE2: "सभी को खत्म करें",
    TUT_ELIMINATE_ALL_DESC2:
      "दुश्मन आपको केवल तभी मार सकते हैं जब आप स्कोप इन किए हुए हों या जब आप अपना शॉट मिस कर देते हैं",
    TUT_GRENADE_COLLECTED_TITLE: "ग्रेनेड मिला!",
    TUT_GRENADE_COLLECTED_DESC:
      "आपको एक ग्रेनेड मिला है! यह मेडकिट या बारूद (Ammo) भी हो सकता है। जारी रखने के लिए टैप करें",
    TUT_GRENADE_COLLECTED_TITLE2: "ग्रेनेड मिला!",
    TUT_GRENADE_COLLECTED_DESC2:
      "आपको एक ग्रेनेड मिला है! यह मेडकिट या बारूद (Ammo) भी हो सकता है। जारी रखने के लिए क्लिक करें",
    TUT_GRENADE_EQUIP_TITLE: "ग्रेनेड हाथ में लें",
    TUT_GRENADE_EQUIP_DESC:
      "ग्रेनेड को अपने हाथ में लेने के लिए ग्रेनेड आइकन पर टैप करें",
    TUT_GRENADE_EQUIP_TITLE2: "ग्रेनेड हाथ में लें",
    TUT_GRENADE_EQUIP_DESC2:
      "ग्रेनेड को अपने हाथ में लेने के लिए G की (key) दबाएं या माउस व्हील स्क्रॉल करें",
    TUT_GRENADE_AIM_TITLE: "ग्रेनेड निशाना लगाएं",
    TUT_GRENADE_AIM_DESC:
      "ग्रेनेड के प्रक्षेपवक्र (trajectory) को लक्षित करने के लिए स्क्रीन के दाईं (RIGHT) ओर दबाकर रखें!",
    TUT_GRENADE_AIM_TITLE2: "ग्रेनेड निशाना लगाएं",
    TUT_GRENADE_AIM_DESC2:
      "ग्रेनेड के प्रक्षेपवक्र (trajectory) को लक्षित करने के लिए राइट क्लिक बटन दबाकर रखें!",
    TUT_GRENADE_THROW_TITLE: "ग्रेनेड फेंकें",
    TUT_GRENADE_THROW_DESC: "ग्रेनेड फेंकने के लिए छोड़ें!",
    TUT_GRENADE_THROW_TITLE2: "ग्रेनेड फेंकें",
    TUT_GRENADE_THROW_DESC2:
      "ग्रेनेड फेंकने के लिए माउस का लेफ्ट बटन क्लिक करें!",
    TUT_GRENADE_ELIMINATE_TITLE: "सभी को खत्म करें",
    TUT_GRENADE_ELIMINATE_DESC: "बचे हुए सभी दुश्मनों को खत्म करें!",
    TUT_GRENADE_ELIMINATE_TITLE2: "सभी को खत्म करें",
    TUT_GRENADE_ELIMINATE_DESC2: "बचे हुए सभी दुश्मनों को खत्म करें!",
    TUT_SCORE_TITLE: "स्कोर और किल्स",
    TUT_SCORE_DESC: "बस इतना ही! आप यहाँ अपने स्कोर और किल्स ट्रैक कर सकते हैं! खेलना जारी रखने के लिए कहीं भी टैप करें",
    TUT_SCORE_TITLE2: "स्कोर और किल्स",
    TUT_SCORE_DESC2: "बस इतना ही! आप यहाँ अपने स्कोर और किल्स ट्रैक कर सकते हैं! खेलना जारी रखने के लिए कहीं भी क्लिक करें",

    // Store
    STORE_TITLE: "स्टोर",
    STORE_GUNS: "बंदूकें",
    STORE_POWERUPS: "पावर-अप्स",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "शॉटगन",
    STORE_ROCKET_LAUNCHER: "रॉकेट लॉन्चर",
    STORE_GRENADE: "ग्रेनेड",
    STORE_AMMO_PACK: "एमो पैक",
    STORE_AK47: "AK47",
    STORE_SNIPER: "स्नाइपर",
    STORE_SELECT_AN_ITEM: "एक वस्तु चुनें",
    STORE_CHOOSE_LIST: "सूची से चुनें",
    STORE_DRAG_ROTATE: "घुमाने के लिए ड्रैग करें",
    STORE_PRIMARY_WEAPON: "प्राथमिक हथियार",
    STORE_POWERUP_SUB: "पावर-अप",
    STORE_PURCHASED: "खरीदा गया",
    STORE_BUY: "खरीदें",
    STORE_OWNED: "स्वामित्व में",
    STORE_MAX_LIMIT: "अधिकतम सीमा",
    STORE_CLOSE: "बंद करें",
    STORE_NOT_ENOUGH_CASH: "पर्याप्त कैश नहीं है!",
    STORE_PURCHASE_AGAIN: "आप इसे अगले राउंड में फिर से खरीद सकते हैं!",
    SELECT_WEAPONS_TITLE: "हथियार चुनें",
    SELECT_CONTINUE: "जारी रखें",

    // Weapon Names
    RIFLE: "राइफल",
    SNIPER: "स्नाइपर",

    // Additional UI
    ON: "चालू",
    OFF: "बंद",
    TIP_LABEL: "सुझाव:",
    NEXT_WAVE: "अगली लहर",
    PLAYER_NAME_TITLE: "खिलाड़ी का नाम",
  },

  es: {
    // Lobby & Settings
    SETTINGS: "AJUSTES",
    CONTROLS: "CONTROLES",
    CTRL_CLASSIC: "Clásico",
    CTRL_HOLD_FIRE: "Mantener",
    SENSITIVITY: "SENSIBILIDAD",
    MUSIC: "MÚSICA",
    SFX: "SFX",
    LANGUAGE: "IDIOMA",
    CLOSE: "CERRAR",
    START: "EMPEZAR",
    GO_TO_LOBBY: "IR AL LOBBY",
    HIGHSCORE: "RÉCORD",
    MAX_KILLS: "Bajas Máximas",
    WELCOME_BACK: "Bienvenido de nuevo",
    PLAYER: "JUGADOR",

    // HUD - Game
    HEALTH: "SALUD",
    AMMO: "MUNICIÓN",
    SCORE: "PUNTOS",
    KILLS: "BAJAS",
    WAVE: "OLEADA",
    COMBO: "COMBO",

    // Game Over Screen
    GAME_OVER: "FIN DE LA PARTIDA",
    YOU_DIED: "¡HAS MUERTO!",
    YOU_SURVIVED: "¡HAS SOBREVIVIDO!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "BAJAS CON FUSIL",
    SNIPER_KILLS: "BAJAS CON FRANCOTIRADOR",

    // Rewarded Ad Popup
    RA_TITLE: "¿CONTINUAR?",
    RA_MESSAGE: "¡Mira un anuncio para restaurar la salud y seguir jugando!",
    RA_WATCH_AD: "VER ANUNCIO",
    RA_NO_THANKS: "NO, GRACIAS",
    RA_HP_TEXT: "+100 HP",

    // Collectable Types
    MED_KIT: "BOTIQUÍN",
    RIFLE_AMMO: "MUNICIÓN DE FUSIL",
    SNIPER_AMMO: "MUNICIÓN DE FRANCOTIRADOR",
    GRENADE: "GRANADA",
    FULL_HP: "(VIDA MÁXIMA)",
    FULL_AMMO: "(LLENO)",
    HP_SHORT: "HP",

    // Kill Types
    HEADSHOT: "HEADSHOT",
    BODYSHOT: "TIRO AL CUERPO",
    KILLSTREAK: "RACHA DE BAJAS",

    // Tips & Messages
    TIP: "CONSEJO",
    KEEP_MOVING: "¡SIGUE MOVIÉNDOTE Y CÚBRETE PARA SOBREVIVIR!",
    AIM_FOR_HEAD: "¡APUNTA A LA CABEZA PARA DAÑO ADICIONAL!",
    RELOAD_EARLY: "¡RECARGA ANTES DE NECESITARLO, NO EN MITAD DE UNA PELEA!",
    USE_COVER: "¡CÚBRETE PARA ASOMARTE Y DISPARAR — MANTENTE OCULTO!",
    COMBO_BONUS: "¡MÁS COMBO = MAYOR BONO DE PUNTOS!",
    ELIMINATE_ENEMIES:
      "¡ELIMINA A TODOS LOS ENEMIGOS PARA AVANZAR A LA SIGUIENTE OLEADA!",
    GET_READY: "¡PREPÁRATE!",
    SURVIVE_STREETS: "¡SOBREVIVE EN LAS CALLES LO MÁS QUE PUEDAS!",
    LOADING: "CARGANDO...",
    LOADING_ASSETS: "Cargando recursos…",

    // In-game Feedback
    AMMO_OUT: "¡SIN MUNICIÓN!",
    WAVE_CLEAR: "¡OLEADA COMPLETADA!",
    WAVE_COMPLETE: "OLEADA COMPLETADA",

    // Player Name
    ENTER_NAME: "INTRODUCE TU NOMBRE",
    TYPE_NAME: "Escribe tu nombre",
    SAVE: "GUARDAR",
    EDIT_NAME: "Editar nombre de jugador",

    // Lobby labels
    WELCOME_BACK: "Bienvenido de nuevo",

    // Game Over
    GO_TO_LOBBY: "IR AL LOBBY",
    SCORE: "PUNTOS",

    // Kill feedback
    HEADSHOT: "¡HEADSHOT!",
    BODYSHOT: "TIRO AL CUERPO",
    KILLSTREAK: "RACHA DE BAJAS",

    // Tutorial
    TUT_CAMERA_TITLE: "Apuntar Cámara",
    TUT_CAMERA_DESC:
      "Arrastra la pantalla para ver a los enemigos cercanos",
    TUT_CAMERA_TITLE2: "Apuntar Cámara",
    TUT_CAMERA_DESC2:
      "Mueve el ratón para apuntar la cámara hacia los enemigos",
    TUT_ADS_TITLE: "Apuntar con Mira",
    TUT_ADS_DESC:
      "Toca el botón de la MIRA a la izquierda para usar la mira y apuntar con precisión",
    TUT_ADS_TITLE2: "Mira de Precisión",
    TUT_ADS_DESC2: "Mantén presionado el botón de clic DERECHO para usar la mira y apuntar con precisión.",
    TUT_ADS_FIRE_TITLE: "¡Fuego!",
    TUT_ADS_FIRE_DESC: "Ajusta la cámara y toca disparar para tirar",
    TUT_ADS_FIRE_TITLE2: "¡Fuego!",
    TUT_ADS_FIRE_DESC2: "¡Haz clic IZQUIERDO para disparar!",
    TUT_JOYSTICK_AIM_TITLE: "Mantén para apuntar",
    TUT_JOYSTICK_AIM_DESC: "¡Mantén pulsado el botón de disparo para usar la mira y apuntar con precisión!",
    TUT_JOYSTICK_FIRE_TITLE: "¡Suelta para disparar!",
    TUT_JOYSTICK_FIRE_DESC: "¡Suelta el botón de disparo para disparar al enemigo!",
    TUT_GUN_SWITCH_TITLE: "Cambiar de Arma",
    TUT_GUN_SWITCH_DESC:
      "Toca el botón de cambio de arma para alternar tus armas",
    TUT_GUN_SWITCH_TITLE2: "Cambiar de Arma",
    TUT_GUN_SWITCH_DESC2:
      "Presiona TAB o los números 1 o 2, o gira la rueda de tu ratón para cambiar de arma",
    TUT_ELIMINATE_ALL_TITLE: "Eliminar a Todos",
    TUT_ELIMINATE_ALL_DESC:
      "Los enemigos solo te golpean mientras usas la mira o cuando fallas tu disparo",
    TUT_ELIMINATE_ALL_TITLE2: "Eliminar a Todos",
    TUT_ELIMINATE_ALL_DESC2:
      "Los enemigos solo te golpean mientras usas la mira o cuando fallas tu disparo",
    TUT_GRENADE_COLLECTED_TITLE: "¡Granada Recogida!",
    TUT_GRENADE_COLLECTED_DESC:
      "¡Has recogido una GRANADA! También podría ser un botiquín o munición. Toca para continuar",
    TUT_GRENADE_COLLECTED_TITLE2: "¡Granada Recogida!",
    TUT_GRENADE_COLLECTED_DESC2:
      "¡Has recogido una GRANADA! Also podría ser un botiquín o munición. Haz clic para continuar",
    TUT_GRENADE_EQUIP_TITLE: "Equipar Granada",
    TUT_GRENADE_EQUIP_DESC:
      "Toca el icono de la GRANADA para equiparla en tu mano",
    TUT_GRENADE_EQUIP_TITLE2: "Equipar Granada",
    TUT_GRENADE_EQUIP_DESC2:
      "Presiona la tecla G o gira la rueda del ratón para equipar la granada en tu mano",
    TUT_GRENADE_AIM_TITLE: "Apuntar Granada",
    TUT_GRENADE_AIM_DESC:
      "¡Mantén presionado el lado DERECHO de la pantalla para apuntar la trayectoria de la granada!",
    TUT_GRENADE_AIM_TITLE2: "Apuntar Granada",
    TUT_GRENADE_AIM_DESC2: "¡Mantén presionado el botón de clic DERECHO para apuntar la trayectoria de la granada!",
    TUT_GRENADE_THROW_TITLE: "Lanzar Granada",
    TUT_GRENADE_THROW_DESC: "¡Suelta para lanzar la granada!",
    TUT_GRENADE_THROW_TITLE2: "Lanzar Granada",
    TUT_GRENADE_THROW_DESC2:
      "¡Haz clic con el botón IZQUIERDO del ratón para lanzar la granada!",
    TUT_GRENADE_ELIMINATE_TITLE: "Eliminar a Todos",
    TUT_GRENADE_ELIMINATE_DESC: "¡Elimina a todos los enemigos restantes!",
    TUT_GRENADE_ELIMINATE_TITLE2: "Eliminar a Todos",
    TUT_GRENADE_ELIMINATE_DESC2: "¡Elimina a todos los enemigos restantes!",
    TUT_SCORE_TITLE: "Puntuación y Bajas",
    TUT_SCORE_DESC: "¡Eso es todo! ¡Puedes ver tu PUNTUACIÓN y BAJAS aquí! Toca en cualquier lugar para seguir jugando",
    TUT_SCORE_TITLE2: "Puntuación y Bajas",
    TUT_SCORE_DESC2: "¡Eso es todo! ¡Puedes ver tu PUNTUACIÓN y BAJAS aquí! Haz clic en cualquier lugar para seguir jugando",

    // Store
    STORE_TITLE: "TIENDA",
    STORE_GUNS: "ARMAS",
    STORE_POWERUPS: "POTENCIADORES",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "ESCOPETA",
    STORE_ROCKET_LAUNCHER: "LANZAMISILES",
    STORE_GRENADE: "GRANADA",
    STORE_AMMO_PACK: "PACK DE MUNICIÓN",
    STORE_AK47: "AK47",
    STORE_SNIPER: "FRANCOTIRADOR",
    STORE_SELECT_AN_ITEM: "SELECCIONA UN OBJETO",
    STORE_CHOOSE_LIST: "Elige de la lista",
    STORE_DRAG_ROTATE: "Arrastra para rotar",
    STORE_PRIMARY_WEAPON: "Arma Principal",
    STORE_POWERUP_SUB: "Potenciador",
    STORE_PURCHASED: "comprado",
    STORE_BUY: "COMPRAR",
    STORE_OWNED: "EN PROPIEDAD",
    STORE_MAX_LIMIT: "LÍMITE MÁXIMO",
    STORE_CLOSE: "CERRAR",
    STORE_NOT_ENOUGH_CASH: "¡DINERO INSUFICIENTE!",
    STORE_PURCHASE_AGAIN: "¡Puedes comprarlo de nuevo en la siguiente ronda!",
    SELECT_WEAPONS_TITLE: "SELECCIONAR ARMAS",
    SELECT_CONTINUE: "CONTINUAR",

    // Weapon Names
    RIFLE: "RIFLE",
    SNIPER: "FRANCOTIRADOR",

    // Additional UI
    ON: "ENCENDIDO",
    OFF: "APAGADO",
    TIP_LABEL: "CONSEJO:",
    NEXT_WAVE: "SIGUIENTE OLEADA",
    PLAYER_NAME_TITLE: "NOMBRE DEL JUGADOR",
  },

  "zh-hans": {
    // Lobby & Settings
    SETTINGS: "设置",
    CONTROLS: "控制",
    CTRL_CLASSIC: "经典",
    CTRL_HOLD_FIRE: "按住开火",
    SENSITIVITY: "灵敏度",
    MUSIC: "音乐",
    SFX: "音效",
    LANGUAGE: "语言",
    CLOSE: "关闭",
    START: "开始",
    GO_TO_LOBBY: "返回大厅",
    HIGHSCORE: "最高分",
    MAX_KILLS: "最高击杀",
    WELCOME_BACK: "欢迎回来",
    PLAYER: "玩家",

    // HUD - Game
    HEALTH: "生命值",
    AMMO: "弹药",
    SCORE: "得分",
    KILLS: "击杀",
    WAVE: "波次",
    COMBO: "连击",

    // Game Over Screen
    GAME_OVER: "游戏结束",
    YOU_DIED: "你死了！",
    YOU_SURVIVED: "你幸存了下来！",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "步枪击杀",
    SNIPER_KILLS: "狙击枪击杀",

    // Rewarded Ad Popup
    RA_TITLE: "继续游戏？",
    RA_MESSAGE: "观看广告以恢复生命值并继续游戏！",
    RA_WATCH_AD: "观看广告",
    RA_NO_THANKS: "不，谢谢",
    RA_HP_TEXT: "+100 生命值",

    // Collectable Types
    MED_KIT: "医疗包",
    RIFLE_AMMO: "步枪弹药",
    SNIPER_AMMO: "狙击枪弹药",
    GRENADE: "手雷",
    FULL_HP: "(生命值已满)",
    FULL_AMMO: "(满)",
    HP_SHORT: "血量",

    // Kill Types
    HEADSHOT: "爆头",
    BODYSHOT: "击中身体",
    KILLSTREAK: "连杀",

    // Tips & Messages
    TIP: "提示",
    KEEP_MOVING: "保持移动并利用掩体生存！",
    AIM_FOR_HEAD: "瞄准头部以造成额外伤害！",
    RELOAD_EARLY: "在需要前换弹——不要在战斗中换弹！",
    USE_COVER: "利用掩体窥视和射击——保持隐蔽！",
    COMBO_BONUS: "更高的连击 = 更高的得分奖励！",
    ELIMINATE_ENEMIES: "消灭所有敌人以进入下一波！",
    GET_READY: "准备好！",
    SURVIVE_STREETS: "在街头尽可能久地生存下去！",
    LOADING: "加载中...",
    LOADING_ASSETS: "加载资源中…",

    // In-game Feedback
    AMMO_OUT: "弹药耗尽！",
    WAVE_CLEAR: "波次清除！",
    WAVE_COMPLETE: "波次完成",

    // Player Name
    ENTER_NAME: "输入你的名字",
    TYPE_NAME: "输入名字",
    SAVE: "保存",
    EDIT_NAME: "编辑玩家名称",

    // Lobby labels
    WELCOME_BACK: "欢迎回来",

    // Game Over
    GO_TO_LOBBY: "返回大厅",
    SCORE: "得分",

    // Kill feedback
    HEADSHOT: "爆头！",
    BODYSHOT: "击中身体",
    KILLSTREAK: "连杀",

    // Tutorial
    TUT_CAMERA_TITLE: "镜头瞄准",
    TUT_CAMERA_DESC: "拖动屏幕以观察附近的敌人",
    TUT_CAMERA_TITLE2: "镜头瞄准",
    TUT_CAMERA_DESC2: "移动鼠标以将镜头瞄准敌人",
    TUT_ADS_TITLE: "开镜瞄准",
    TUT_ADS_DESC: "轻按左侧的瞄准镜按钮开镜并进行精确瞄准",
    TUT_ADS_TITLE2: "精确瞄准",
    TUT_ADS_DESC2: "按住鼠标右键以开镜并进行精确瞄准。",
    TUT_ADS_FIRE_TITLE: "开火！",
    TUT_ADS_FIRE_DESC: "调整镜头并轻按开火键进行射击",
    TUT_ADS_FIRE_TITLE2: "开火！",
    TUT_ADS_FIRE_DESC2: "点击左键开火！",
    TUT_GUN_SWITCH_TITLE: "切换武器",
    TUT_GUN_SWITCH_DESC: "轻按武器切换按钮来更换武器",
    TUT_GUN_SWITCH_TITLE2: "切换武器",
    TUT_GUN_SWITCH_DESC2: "按 TAB 键、数字键 1 或 2，或滚动鼠标滚轮来切换武器",
    TUT_ELIMINATE_ALL_TITLE: "消灭所有敌人",
    TUT_ELIMINATE_ALL_DESC: "敌人只有在您开镜瞄准或未击中目标时才会击中您",
    TUT_ELIMINATE_ALL_TITLE2: "消灭所有敌人",
    TUT_ELIMINATE_ALL_DESC2: "敌人只有在您开镜瞄准或未击中目标时才会击中您",
    TUT_GRENADE_COLLECTED_TITLE: "已收集手榴弹！",
    TUT_GRENADE_COLLECTED_DESC:
      "您收集了一枚手榴弹！它也可能是医疗包或弹药。轻按屏幕继续",
    TUT_GRENADE_COLLECTED_TITLE2: "已收集手榴弹！",
    TUT_GRENADE_COLLECTED_DESC2:
      "您收集了一枚手榴弹！它也可能是医疗包或弹药。点击鼠标继续",
    TUT_GRENADE_EQUIP_TITLE: "装备手榴弹",
    TUT_GRENADE_EQUIP_DESC: "轻按手榴弹图标将其装备到手中",
    TUT_GRENADE_EQUIP_TITLE2: "装备手榴弹",
    TUT_GRENADE_EQUIP_DESC2: "按 G 键或滚动鼠标滚轮将手榴弹装备到手中",
    TUT_GRENADE_AIM_TITLE: "瞄准手榴弹",
    TUT_GRENADE_AIM_DESC: "按住屏幕右侧以瞄准手榴弹的投掷轨迹！",
    TUT_GRENADE_AIM_TITLE2: "瞄准手榴弹",
    TUT_GRENADE_AIM_DESC2: "按住鼠标右键以瞄准手榴弹的投掷轨迹！",
    TUT_GRENADE_THROW_TITLE: "投掷手榴弹",
    TUT_GRENADE_THROW_DESC: "松开即可投掷手榴弹！",
    TUT_GRENADE_THROW_TITLE2: "投掷手榴弹",
    TUT_GRENADE_THROW_DESC2: "点击鼠标左键投掷手榴弹！",
    TUT_GRENADE_ELIMINATE_TITLE: "消灭所有敌人",
    TUT_GRENADE_ELIMINATE_DESC: "消灭所有剩余的敌人！",
    TUT_GRENADE_ELIMINATE_TITLE2: "消灭所有敌人",
    TUT_GRENADE_ELIMINATE_DESC2: "消灭所有剩余的敌人！",
    TUT_SCORE_TITLE: "得分与击杀",
    TUT_SCORE_DESC: "就是这样！您可以在这里查看您的得分和击杀数！轻按任意位置继续游戏",
    TUT_SCORE_TITLE2: "得分与击杀",
    TUT_SCORE_DESC2: "就是这样！您可以在这里查看您的得分和击杀数！点击任意位置继续游戏",

    // Store
    STORE_TITLE: "商店",
    STORE_GUNS: "枪械",
    STORE_POWERUPS: "道具",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "霰弹枪",
    STORE_ROCKET_LAUNCHER: "火箭筒",
    STORE_GRENADE: "手榴弹",
    STORE_AMMO_PACK: "弹药包",
    STORE_AK47: "AK47",
    STORE_SNIPER: "狙击枪",
    STORE_SELECT_AN_ITEM: "选择一个物品",
    STORE_CHOOSE_LIST: "从列表中选择",
    STORE_DRAG_ROTATE: "拖动旋转",
    STORE_PRIMARY_WEAPON: "主武器",
    STORE_POWERUP_SUB: "道具",
    STORE_PURCHASED: "已购买",
    STORE_BUY: "购买",
    STORE_OWNED: "已拥有",
    STORE_MAX_LIMIT: "上限",
    STORE_CLOSE: "关闭",
    STORE_NOT_ENOUGH_CASH: "现金不足！",
    STORE_PURCHASE_AGAIN: "您可以在下一局再次购买！",
    SELECT_WEAPONS_TITLE: "选择武器",
    SELECT_CONTINUE: "继续",

    // Weapon Names
    RIFLE: "步枪",
    SNIPER: "狙击枪",

    // Additional UI
    ON: "开启",
    OFF: "关闭",
    TIP_LABEL: "提示：",
    NEXT_WAVE: "下一波",
    PLAYER_NAME_TITLE: "玩家名称",
  },

  "zh-hant": {
    // Lobby & Settings
    SETTINGS: "設定",
    CONTROLS: "控制",
    CTRL_CLASSIC: "經典",
    CTRL_HOLD_FIRE: "按住開火",
    SENSITIVITY: "靈敏度",
    MUSIC: "音樂",
    SFX: "音效",
    LANGUAGE: "語言",
    CLOSE: "關閉",
    START: "開始",
    GO_TO_LOBBY: "返回大廳",
    HIGHSCORE: "最高分",
    MAX_KILLS: "最高擊殺",
    WELCOME_BACK: "歡迎回來",
    PLAYER: "玩家",

    // HUD - Game
    HEALTH: "生命值",
    AMMO: "彈藥",
    SCORE: "得分",
    KILLS: "擊殺",
    WAVE: "波次",
    COMBO: "連擊",

    // Game Over Screen
    GAME_OVER: "遊戲結束",
    YOU_DIED: "你死了！",
    YOU_SURVIVED: "你倖存了下來！",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "步槍擊殺",
    SNIPER_KILLS: "狙擊槍擊殺",

    // Rewarded Ad Popup
    RA_TITLE: "繼續遊戲？",
    RA_MESSAGE: "觀看廣告以恢復生命值並繼續遊戲！",
    RA_WATCH_AD: "觀看廣告",
    RA_NO_THANKS: "不用了，謝謝",
    RA_HP_TEXT: "+100 生命值",

    // Collectable Types
    MED_KIT: "醫療包",
    RIFLE_AMMO: "步槍彈藥",
    SNIPER_AMMO: "狙擊槍彈藥",
    GRENADE: "手雷",
    FULL_HP: "(生命值已滿)",
    FULL_AMMO: "(滿)",
    HP_SHORT: "血量",

    // Kill Types
    HEADSHOT: "爆頭",
    BODYSHOT: "擊中身體",
    KILLSTREAK: "連殺",

    // Tips & Messages
    TIP: "提示",
    KEEP_MOVING: "保持移動並利用掩體生存！",
    AIM_FOR_HEAD: "瞄準頭部以造成額外傷害！",
    RELOAD_EARLY: "在需要前換彈——不要在戰鬥中換彈！",
    USE_COVER: "利用掩體窺視和射擊——保持隱蔽！",
    COMBO_BONUS: "更高的連擊 = 更高的得分獎勵！",
    ELIMINATE_ENEMIES: "消滅所有敵人以進入下一波！",
    GET_READY: "準備好！",
    SURVIVE_STREETS: "在街頭盡可能久地生存下去！",
    LOADING: "載入中...",
    LOADING_ASSETS: "載入資源中…",

    // In-game Feedback
    AMMO_OUT: "彈藥耗盡！",
    WAVE_CLEAR: "波次清除！",
    WAVE_COMPLETE: "波次完成",

    // Player Name
    ENTER_NAME: "輸入你的名字",
    TYPE_NAME: "輸入名字",
    SAVE: "儲存",
    EDIT_NAME: "編輯玩家名稱",

    // Lobby labels
    WELCOME_BACK: "歡迎回來",

    // Game Over
    GO_TO_LOBBY: "返回大廳",
    SCORE: "得分",

    // Kill feedback
    HEADSHOT: "爆頭！",
    BODYSHOT: "擊中身體",
    KILLSTREAK: "連殺",

    // Tutorial
    TUT_CAMERA_TITLE: "鏡頭瞄準",
    TUT_CAMERA_DESC: "拖曳螢幕以觀察附近的敵人",
    TUT_CAMERA_TITLE2: "鏡頭瞄準",
    TUT_CAMERA_DESC2: "移動滑鼠以將鏡頭瞄準敵人",
    TUT_ADS_TITLE: "開鏡瞄準",
    TUT_ADS_DESC: "輕按左側的瞄準鏡按鈕開鏡並進行精確瞄準",
    TUT_ADS_TITLE2: "精確瞄準",
    TUT_ADS_DESC2: "按住滑鼠右鍵以開鏡並進行精確瞄準。",
    TUT_ADS_FIRE_TITLE: "開火！",
    TUT_ADS_FIRE_DESC: "調整鏡頭並輕按開火鍵進行射擊",
    TUT_ADS_FIRE_TITLE2: "開火！",
    TUT_ADS_FIRE_DESC2: "點擊左鍵開火！",
    TUT_GUN_SWITCH_TITLE: "切換武器",
    TUT_GUN_SWITCH_DESC: "輕按武器切換按鈕來更換武器",
    TUT_GUN_SWITCH_TITLE2: "切換武器",
    TUT_GUN_SWITCH_DESC2: "按 TAB 鍵、數字鍵 1 或 2，或滾動滑鼠滾輪來切換武器",
    TUT_ELIMINATE_ALL_TITLE: "消滅所有敵人",
    TUT_ELIMINATE_ALL_DESC: "敵人只有在您開鏡瞄準或未擊中目標時才會擊中您",
    TUT_ELIMINATE_ALL_TITLE2: "消滅所有敵人",
    TUT_ELIMINATE_ALL_DESC2: "敵人只有在您開鏡瞄準或未擊中目標時才會擊中您",
    TUT_GRENADE_COLLECTED_TITLE: "已收集手榴彈！",
    TUT_GRENADE_COLLECTED_DESC:
      "您收集了一枚手榴彈！它也可能是醫療包或彈藥。輕按螢幕繼續",
    TUT_GRENADE_COLLECTED_TITLE2: "已收集手榴彈！",
    TUT_GRENADE_COLLECTED_DESC2:
      "您收集了一枚手榴彈！它也可能是醫療包或彈藥。點擊滑鼠繼續",
    TUT_GRENADE_EQUIP_TITLE: "裝備手榴彈",
    TUT_GRENADE_EQUIP_DESC: "輕按手榴彈圖示將其裝備到手中",
    TUT_GRENADE_EQUIP_TITLE2: "裝備手榴彈",
    TUT_GRENADE_EQUIP_DESC2: "按 G 鍵或滾動滑鼠滾輪將手榴彈裝備到手中",
    TUT_GRENADE_AIM_TITLE: "瞄準手榴彈",
    TUT_GRENADE_AIM_DESC: "按住螢幕右側以瞄準手榴彈的投擲軌跡！",
    TUT_GRENADE_AIM_TITLE2: "瞄準手榴彈",
    TUT_GRENADE_AIM_DESC2: "按住滑鼠右鍵以瞄準手榴彈的投擲軌跡！",
    TUT_GRENADE_THROW_TITLE: "投擲手榴彈",
    TUT_GRENADE_THROW_DESC: "鬆開即可投擲手榴彈！",
    TUT_GRENADE_THROW_TITLE2: "投擲手榴彈",
    TUT_GRENADE_THROW_DESC2: "點擊滑鼠左鍵投擲手榴彈！",
    TUT_GRENADE_ELIMINATE_TITLE: "消滅所有敵人",
    TUT_GRENADE_ELIMINATE_DESC: "消滅所有剩餘的敵人！",
    TUT_GRENADE_ELIMINATE_TITLE2: "消滅所有敵人",
    TUT_GRENADE_ELIMINATE_DESC2: "消滅所有剩餘的敵人！",
    TUT_SCORE_TITLE: "得分與擊殺",
    TUT_SCORE_DESC: "就是這樣！您可以在這裡查看您的得分和擊殺數！輕按任意位置繼續遊戲",
    TUT_SCORE_TITLE2: "得分與擊殺",
    TUT_SCORE_DESC2: "就是這樣！您可以在這裡查看您的得分和擊殺數！點擊任意位置繼續遊戲",

    // Store
    STORE_TITLE: "商店",
    STORE_GUNS: "槍械",
    STORE_POWERUPS: "道具",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "霰彈槍",
    STORE_ROCKET_LAUNCHER: "火箭筒",
    STORE_GRENADE: "手榴彈",
    STORE_AMMO_PACK: "彈藥包",
    STORE_AK47: "AK47",
    STORE_SNIPER: "狙擊槍",
    STORE_SELECT_AN_ITEM: "選擇一個物品",
    STORE_CHOOSE_LIST: "從列表中選擇",
    STORE_DRAG_ROTATE: "拖動旋轉",
    STORE_PRIMARY_WEAPON: "主武器",
    STORE_POWERUP_SUB: "道具",
    STORE_PURCHASED: "已購買",
    STORE_BUY: "購買",
    STORE_OWNED: "已擁有",
    STORE_MAX_LIMIT: "上限",
    STORE_CLOSE: "關閉",
    STORE_NOT_ENOUGH_CASH: "現金不足！",
    STORE_PURCHASE_AGAIN: "您可以在下一局再次購買！",
    SELECT_WEAPONS_TITLE: "選擇武器",
    SELECT_CONTINUE: "繼續",

    // Weapon Names
    RIFLE: "步槍",
    SNIPER: "狙擊槍",

    // Additional UI
    ON: "開啟",
    OFF: "關閉",
    TIP_LABEL: "提示：",
    NEXT_WAVE: "下一波",
    PLAYER_NAME_TITLE: "玩家名稱",
  },

  ar: {
    // Lobby & Settings
    SETTINGS: "الإعدادات",
    CONTROLS: "عناصر التحكم",
    CTRL_CLASSIC: "كلاسيكي",
    CTRL_HOLD_FIRE: "ضغط للإطلاق",
    SENSITIVITY: "الحساسية",
    MUSIC: "الموسيقى",
    SFX: "المؤثرات",
    LANGUAGE: "اللغة",
    CLOSE: "إغلاق",
    START: "ابدأ",
    GO_TO_LOBBY: "الذهاب إلى الردهة",
    HIGHSCORE: "أعلى نتيجة",
    MAX_KILLS: "أقصى عمليات قتل",
    WELCOME_BACK: "مرحبًا بعودتك",
    PLAYER: "اللاعب",

    // HUD - Game
    HEALTH: "الصحة",
    AMMO: "الذخيرة",
    SCORE: "النتيجة",
    KILLS: "القتلى",
    WAVE: "الموجة",
    COMBO: "كومبو",

    // Game Over Screen
    GAME_OVER: "انتهت اللعبة",
    YOU_DIED: "لقد مت!",
    YOU_SURVIVED: "لقد نجوت!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "قتلى البندقية",
    SNIPER_KILLS: "قتلى القناصة",

    // Rewarded Ad Popup
    RA_TITLE: "متابعة؟",
    RA_MESSAGE: "شاهد إعلانًا لاستعادة صحتك ومواصلة اللعب!",
    RA_WATCH_AD: "شاهد الإعلان",
    RA_NO_THANKS: "لا، شكراً",
    RA_HP_TEXT: "+100 نقطة صحة",

    // Collectable Types
    MED_KIT: "حقيبة إسعافات",
    RIFLE_AMMO: "ذخيرة بندقية",
    SNIPER_AMMO: "ذخيرة قناصة",
    GRENADE: "قنبلة يدوية",
    FULL_HP: "(صحة كاملة)",
    FULL_AMMO: "(ممتلئ)",
    HP_SHORT: "الصحة",

    // Kill Types
    HEADSHOT: "إصابة رأس",
    BODYSHOT: "إصابة جسد",
    KILLSTREAK: "سلسلة قتل",

    // Tips & Messages
    TIP: "نصيحة",
    KEEP_MOVING: "تحرك باستمرار واستخدم السواتر للبقاء على قيد الحياة!",
    AIM_FOR_HEAD: "استهدف الرأس لإلحاق ضرر إضافي!",
    RELOAD_EARLY: "أعد التعبئة قبل الحاجة — ليس أثناء القتال!",
    USE_COVER: "استخدم السواتر للاستراق وإطلاق النار — ابق متخفيًا!",
    COMBO_BONUS: "كومبو أعلى = مكافأة نقاط أكبر!",
    ELIMINATE_ENEMIES: "قضِ على جميع الأعداء للانتقال إلى الموجة التالية!",
    GET_READY: "استعد!",
    SURVIVE_STREETS: "انجُ في الشوارع لأطول فترة ممكنة!",
    LOADING: "جاري التحميل...",
    LOADING_ASSETS: "جاري تحميل الأصول...",

    // In-game Feedback
    AMMO_OUT: "نفذت الذخيرة!",
    WAVE_CLEAR: "تم تطهير الموجة!",
    WAVE_COMPLETE: "اكتملت الموجة",

    // Player Name
    ENTER_NAME: "أدخل اسمك",
    TYPE_NAME: "اكتب الاسم",
    SAVE: "حفظ",
    EDIT_NAME: "تعديل اسم اللاعب",

    // Lobby labels
    WELCOME_BACK: "مرحبًا بعودتك",

    // Game Over
    GO_TO_LOBBY: "الذهاب إلى الردهة",
    SCORE: "النتيجة",

    // Kill feedback
    HEADSHOT: "إصابة رأس!",
    BODYSHOT: "إصابة جسد",
    KILLSTREAK: "سلسلة قتل",

    // Tutorial
    TUT_CAMERA_TITLE: "توجيه الكاميرا",
    TUT_CAMERA_DESC: "اسحب الشاشة لرؤية الأعداء القريبين",
    TUT_CAMERA_TITLE2: "توجيه الكاميرا",
    TUT_CAMERA_DESC2: "حرك الماوس لتوجيه الكاميرا نحو الأعداء",
    TUT_ADS_TITLE: "التصويب بالمنظار",
    TUT_ADS_DESC:
      "اضغط على زر المنظار الموجود على اليسار لفتح المنظار والتصويب بدقة",
    TUT_ADS_TITLE2: "التصويب الدقيق",
    TUT_ADS_DESC2:
      "اضغط مع الاستمرار على زر الماوس الأيمن لفتح المنظار والتصويب بدقة.",
    TUT_ADS_FIRE_TITLE: "إطلاق النار!",
    TUT_ADS_FIRE_DESC: "اضبط الكاميرا واضغط على زر إطلاق النار لإطلاق النار",
    TUT_ADS_FIRE_TITLE2: "إطلاق النار!",
    TUT_ADS_FIRE_DESC2: "انقر على الزر الأيسر للماوس لإطلاق النار!",
    TUT_JOYSTICK_AIM_TITLE: "استمر في الضغط للتصويب",
    TUT_JOYSTICK_AIM_DESC: "استمر في الضغط على زر إطلاق النار للتصويب بدقة!",
    TUT_JOYSTICK_FIRE_TITLE: "حرر لإطلاق النار!",
    TUT_JOYSTICK_FIRE_DESC: "حرر زر إطلاق النار لإطلاق النار على العدو!",
    TUT_GUN_SWITCH_TITLE: "تبديل السلاح",
    TUT_GUN_SWITCH_DESC: "اضغط على زر تبديل السلاح لتغيير السلاح",
    TUT_GUN_SWITCH_TITLE2: "تبديل السلاح",
    TUT_GUN_SWITCH_DESC2: "اضغط على مفتاح TAB أو الأرقام 1 أو 2 أو قم بتمرير عجلة الماوس لتغيير السلاح",
    TUT_ELIMINATE_ALL_TITLE: "القضاء على الجميع",
    TUT_ELIMINATE_ALL_DESC:
      "الأعداء يصيبونك فقط أثناء فتح المنظار أو عندما تخطئ في إطلاق النار",
    TUT_ELIMINATE_ALL_TITLE2: "القضاء على الجميع",
    TUT_ELIMINATE_ALL_DESC2:
      "الأعداء يصيبونك فقط أثناء فتح المنظار أو عندما تخطئ في إطلاق النار",
    TUT_GRENADE_COLLECTED_TITLE: "تم جمع قنبلة!",
    TUT_GRENADE_COLLECTED_DESC:
      "لقد جمعت قنبلة يدوية! قد تكون أيضاً حقيبة إسعافات أولية أو ذخيرة. اضغط للاستمرار",
    TUT_GRENADE_COLLECTED_TITLE2: "تم جمع قنبلة!",
    TUT_GRENADE_COLLECTED_DESC2:
      "لقد جمعت قنبلة يدوية! قد تكون أيضاً حقيبة إسعافات أولية أو ذخيرة. انقر للاستمرار",
    TUT_GRENADE_EQUIP_TITLE: "تجهيز القنبلة",
    TUT_GRENADE_EQUIP_DESC: "اضغط على أيقونة القنبلة لتجهيزها في يدك",
    TUT_GRENADE_EQUIP_TITLE2: "تجهيز القنبلة",
    TUT_GRENADE_EQUIP_DESC2: "اضغط على مفتاح G أو مرر عجلة الماوس لتجهيز القنبلة في يدك",
    TUT_GRENADE_AIM_TITLE: "توجيه القنبلة",
    TUT_GRENADE_AIM_DESC: "اضغط مع الاستمرار على الجانب الأيمن من الشاشة لتوجيه مسار رمي القنبلة!",
    TUT_GRENADE_AIM_TITLE2: "توجيه القنبلة",
    TUT_GRENADE_AIM_DESC2: "اضغط مع الاستمرار على زر الماوس الأيمن لتوجيه مسار رمي القنبلة!",
    TUT_GRENADE_THROW_TITLE: "رمي القنبلة",
    TUT_GRENADE_THROW_DESC: "أفلت لتطلق القنبلة اليدوية!",
    TUT_GRENADE_THROW_TITLE2: "رمي القنبلة",
    TUT_GRENADE_THROW_DESC2: "انقر على الزر الأيسر للماوس لرمي القنبلة اليدوية!",
    TUT_GRENADE_ELIMINATE_TITLE: "القضاء على الجميع",
    TUT_GRENADE_ELIMINATE_DESC: "اقضِ على جميع الأعداء المتبقين!",
    TUT_GRENADE_ELIMINATE_TITLE2: "القضاء على الجميع",
    TUT_GRENADE_ELIMINATE_DESC2: "اقضِ على جميع الأعداء المتبقين!",
    TUT_SCORE_TITLE: "النقاط والقتلى",
    TUT_SCORE_DESC: "هذا كل شيء! يمكنك تتبع نقاطك وقتلاك هنا! اضغط في أي مكان لمواصلة اللعب",
    TUT_SCORE_TITLE2: "النقاط والقتلى",
    TUT_SCORE_DESC2: "هذا كل شيء! يمكنك تتبع نقاطك وقتلاك هنا! انقر في أي مكان لمواصلة اللعب",

    // Store
    STORE_TITLE: "المتجر",
    STORE_GUNS: "الأسلحة",
    STORE_POWERUPS: "تعزيزات",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "بندقية رش",
    STORE_ROCKET_LAUNCHER: "قاذف صواريخ",
    STORE_GRENADE: "قنبلة يدوية",
    STORE_AMMO_PACK: "حزمة ذخيرة",
    STORE_BUY: "شراء",
    STORE_OWNED: "مملوك",
    STORE_MAX_LIMIT: "الحد الأقصى",
    STORE_CLOSE: "إغلاق",
    STORE_NOT_ENOUGH_CASH: "لا يوجد مال كافٍ!",
    STORE_PURCHASE_AGAIN: "يمكنك شراؤها مرة أخرى في الجولة القادمة!",
    SELECT_WEAPONS_TITLE: "اختر الأسلحة",
    SELECT_CONTINUE: "متابعة",

    // Weapon Names
    RIFLE: "بندقية",
    SNIPER: "قناصة",

    // Additional UI
    ON: "تشغيل",
    OFF: "إيقاف",
    TIP_LABEL: "نصيحة:",
    NEXT_WAVE: "الموجة التالية",
    PLAYER_NAME_TITLE: "اسم اللاعب",
  },

  pt: {
    // Lobby & Settings
    SETTINGS: "CONFIGURAÇÕES",
    CONTROLS: "CONTROLES",
    CTRL_CLASSIC: "Clássico",
    CTRL_HOLD_FIRE: "Segurar-Atirar",
    SENSITIVITY: "SENSIBILIDADE",
    MUSIC: "MÚSICA",
    SFX: "SFX",
    LANGUAGE: "IDIOMA",
    CLOSE: "FECHAR",
    START: "INICIAR",
    GO_TO_LOBBY: "IR PARA O LOBBY",
    HIGHSCORE: "RECORDE",
    MAX_KILLS: "MÁXIMO DE ABATES",
    WELCOME_BACK: "Bem-vindo de volta",
    PLAYER: "JOGADOR",

    // HUD - Game
    HEALTH: "SAÚDE",
    AMMO: "MUNIÇÃO",
    SCORE: "PONTOS",
    KILLS: "ABATES",
    WAVE: "ONDA",
    COMBO: "COMBO",

    // Game Over Screen
    GAME_OVER: "FIM DE JOGO",
    YOU_DIED: "VOCÊ MORREU!",
    YOU_SURVIVED: "VOCÊ SOBREVIVEU!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "ABATES DE RIFLE",
    SNIPER_KILLS: "ABATES DE SNIPER",

    // Rewarded Ad Popup
    RA_TITLE: "CONTINUAR?",
    RA_MESSAGE: "Assista a um anúncio para restaurar a vida e continuar jogando!",
    RA_WATCH_AD: "ASSISTIR AO ANÚNCIO",
    RA_NO_THANKS: "NÃO, OBRIGADO",
    RA_HP_TEXT: "+100 HP",

    // Collectable Types
    MED_KIT: "KIT MÉDICO",
    RIFLE_AMMO: "MUNIÇÃO DE RIFLE",
    SNIPER_AMMO: "MUNIÇÃO DE SNIPER",
    GRENADE: "GRANADA",
    FULL_HP: "(VIDA MÁXIMA)",
    FULL_AMMO: "(CHEIO)",
    HP_SHORT: "HP",

    // Kill Types
    HEADSHOT: "HEADSHOT",
    BODYSHOT: "TIRO NO CORPO",
    KILLSTREAK: "SÉRIE DE ABATES",

    // Tips & Messages
    TIP: "DICA",
    KEEP_MOVING: "MANTENHA-SE EM MOVIMENTO E USE COBERTURA PARA SOBREVIVER!",
    AIM_FOR_HEAD: "MIRE NA CABEÇA PARA GANHAR DANO ADICIONAL!",
    RELOAD_EARLY: "RECARREGUE ANTES DE PRECISAR — NÃO DURANTE O COMBATE!",
    USE_COVER: "USE COBERTURA PARA ESPREITAR E ATIRAR — MANTENHA-SE OCULTO!",
    COMBO_BONUS: "COMBO MAIOR = MAIOR BÔNUS DE PONTUAÇÃO!",
    ELIMINATE_ENEMIES:
      "ELIMINE TODOS OS INIMIGOS PARA AVANÇAR PARA A PRÓXIMA ONDA!",
    GET_READY: "PREPARE-SE!",
    SURVIVE_STREETS: "SOBREVIVA NAS RUAS O MÁXIMO QUE PUDER!",
    LOADING: "CARREGANDO...",
    LOADING_ASSETS: "Carregando recursos…",

    // In-game Feedback
    AMMO_OUT: "SEM MUNIÇÃO!",
    WAVE_CLEAR: "ONDA LIMPA!",
    WAVE_COMPLETE: "ONDA COMPLETA",

    // Player Name
    ENTER_NAME: "INSIRA SEU NOME",
    TYPE_NAME: "Digite o nome",
    SAVE: "SALVAR",
    EDIT_NAME: "Editar nome do jogador",

    // Lobby labels
    WELCOME_BACK: "Bem-vindo de volta",

    // Game Over
    GO_TO_LOBBY: "IR PARA O LOBBY",
    SCORE: "PONTOS",

    // Kill feedback
    HEADSHOT: "HEADSHOT!",
    BODYSHOT: "TIRO NO CORPO",
    KILLSTREAK: "SÉRIE DE ABATES",

    // Tutorial
    TUT_CAMERA_TITLE: "Mira da Câmera",
    TUT_CAMERA_DESC:
      "Arraste a tela para ver os inimigos próximos",
    TUT_CAMERA_TITLE2: "Mira da Câmera",
    TUT_CAMERA_DESC2: "Mova o mouse para mirar sua câmera nos inimigos",
    TUT_ADS_TITLE: "Mira com Luneta",
    TUT_ADS_DESC:
      "Toque no botão da LUNETA à esquerda para mirar com a mira telescópica e apontar com precisão",
    TUT_ADS_TITLE2: "Mira de Precisão",
    TUT_ADS_DESC2:
      "Segure o botão de clique DIREITO para mirar com a mira telescópica e apontar com precisão.",
    TUT_ADS_FIRE_TITLE: "Fogo!",
    TUT_ADS_FIRE_DESC: "Ajuste a câmera e toque em disparar para atirar",
    TUT_ADS_FIRE_TITLE2: "Fogo!",
    TUT_ADS_FIRE_DESC2: "Clique com o botão ESQUERDO para atirar!",
    TUT_JOYSTICK_AIM_TITLE: "Segure para mirar",
    TUT_JOYSTICK_AIM_DESC: "Segure o botão de tiro para usar a mira e mirar com precisão!",
    TUT_JOYSTICK_FIRE_TITLE: "Solte para atirar!",
    TUT_JOYSTICK_FIRE_DESC: "Solte o botão de tiro para atirar no inimigo!",
    TUT_GUN_SWITCH_TITLE: "Trocar de Arma",
    TUT_GUN_SWITCH_DESC: "Toque no botão de troca de arma para mudar de arma",
    TUT_GUN_SWITCH_TITLE2: "Trocar de Arma",
    TUT_GUN_SWITCH_DESC2: "Pressione TAB ou os números 1 ou 2 ou role a roda do mouse para mudar de arma",
    TUT_ELIMINATE_ALL_TITLE: "Eliminar Todos",
    TUT_ELIMINATE_ALL_DESC:
      "Os inimigos só atingem você enquanto você está com a mira aberta ou quando erra o tiro",
    TUT_ELIMINATE_ALL_TITLE2: "Eliminar Todos",
    TUT_ELIMINATE_ALL_DESC2:
      "Os inimigos só atingem você enquanto você está com a mira aberta ou quando erra o tiro",
    TUT_GRENADE_COLLECTED_TITLE: "Granada Coletada!",
    TUT_GRENADE_COLLECTED_DESC:
      "Você coletou uma GRANADA! Também poderia ser um kit médico ou munição. Toque para continuar",
    TUT_GRENADE_COLLECTED_TITLE2: "Granada Coletada!",
    TUT_GRENADE_COLLECTED_DESC2:
      "Você coletou uma GRANADA! Também poderia ser um kit médico ou munição. Clique para continuar",
    TUT_GRENADE_EQUIP_TITLE: "Equipar Granada",
    TUT_GRENADE_EQUIP_DESC:
      "Toque no ícone da GRANADA para equipá-la em sua mão",
    TUT_GRENADE_EQUIP_TITLE2: "Equipar Granada",
    TUT_GRENADE_EQUIP_DESC2: "Pressione a tecla G ou role a roda do mouse para equipar a granada em sua mão",
    TUT_GRENADE_AIM_TITLE: "Mirar Granada",
    TUT_GRENADE_AIM_DESC: "Segure o lado DIREITO da tela para mirar a trajetória da granada!",
    TUT_GRENADE_AIM_TITLE2: "Mirar Granada",
    TUT_GRENADE_AIM_DESC2: "Segure o botão de clique DIREITO para mirar a trajetória da granada!",
    TUT_GRENADE_THROW_TITLE: "Arremessar Granada",
    TUT_GRENADE_THROW_DESC: "Solte para arremessar a granada!",
    TUT_GRENADE_THROW_TITLE2: "Arremessar Granada",
    TUT_GRENADE_THROW_DESC2: "Clique com o botão ESQUERDO do mouse para arremessar a granada!",
    TUT_GRENADE_ELIMINATE_TITLE: "Eliminar Todos",
    TUT_GRENADE_ELIMINATE_DESC: "Elimine todos os inimigos restantes!",
    TUT_GRENADE_ELIMINATE_TITLE2: "Eliminar Todos",
    TUT_GRENADE_ELIMINATE_DESC2: "Elimine todos os inimigos restantes!",
    TUT_SCORE_TITLE: "Pontuação e Eliminações",
    TUT_SCORE_DESC:
      "É isso! Você pode acompanhar sua PONTUAÇÃO e ELIMINAÇÕES aqui! Toque em qualquer lugar para continuar jogando",
    TUT_SCORE_TITLE2: "Pontuação e Eliminações",
    TUT_SCORE_DESC2:
      "É isso! Você pode acompanhar sua PONTUAÇÃO e ELIMINAÇÕES aqui! Clique em qualquer lugar para continuar jogando",

    // Store
    STORE_TITLE: "LOJA",
    STORE_GUNS: "ARMAS",
    STORE_POWERUPS: "POWER-UPS",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "ESPINGARDA",
    STORE_ROCKET_LAUNCHER: "LANÇA-FOGUETES",
    STORE_GRENADE: "GRANADA",
    STORE_AMMO_PACK: "PACOTE DE MUNIÇÃO",
    STORE_BUY: "COMPRAR",
    STORE_OWNED: "ADQUIRIDO",
    STORE_MAX_LIMIT: "LIMITE MÁXIMO",
    STORE_CLOSE: "FECHAR",
    STORE_NOT_ENOUGH_CASH: "DINHEIRO INSUFICIENTE!",
    STORE_PURCHASE_AGAIN: "Você pode comprar novamente na próxima rodada!",
    SELECT_WEAPONS_TITLE: "SELECIONAR ARMAS",
    SELECT_CONTINUE: "CONTINUAR",

    // Weapon Names
    RIFLE: "FUZIL",
    SNIPER: "SNIPER",

    // Additional UI
    ON: "LIGADO",
    OFF: "DESLIGADO",
    TIP_LABEL: "DICA:",
    NEXT_WAVE: "PRÓXIMA ONDA",
    PLAYER_NAME_TITLE: "NOME DO JOGADOR",
  },

  fr: {
    // Lobby & Settings
    SETTINGS: "PARAMÈTRES",
    CONTROLS: "COMMANDES",
    CTRL_CLASSIC: "Classique",
    CTRL_HOLD_FIRE: "Maintenir-Tirer",
    SENSITIVITY: "SENSIBILITÉ",
    MUSIC: "MUSIQUE",
    SFX: "SFX",
    LANGUAGE: "LANGUE",
    CLOSE: "FERMER",
    START: "COMMENCER",
    GO_TO_LOBBY: "RETOURNER AU SALON",
    HIGHSCORE: "MEILLEUR SCORE",
    MAX_KILLS: "MAX DE KILLS",
    WELCOME_BACK: "Bon retour",
    PLAYER: "JOUEUR",

    // HUD - Game
    HEALTH: "SANTÉ",
    AMMO: "MUNITIONS",
    SCORE: "SCORE",
    KILLS: "FRAGS",
    WAVE: "VAGUE",
    COMBO: "COMBO",

    // Game Over Screen
    GAME_OVER: "PARTIE TERMINÉE",
    YOU_DIED: "VOUS ÊTES MORT !",
    YOU_SURVIVED: "VOUS AVEZ SURVÉCU !",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "FRAGS AU FUSIL",
    SNIPER_KILLS: "FRAGS AU SNIPER",

    // Rewarded Ad Popup
    RA_TITLE: "CONTINUER ?",
    RA_MESSAGE: "Regardez une publicité pour récupérer des PV et continuer à jouer !",
    RA_WATCH_AD: "REGARDER LA PUB",
    RA_NO_THANKS: "NON MERCI",
    RA_HP_TEXT: "+100 PV",

    // Collectable Types
    MED_KIT: "KIT DE SOINS",
    RIFLE_AMMO: "MUNITIONS DE FUSIL",
    SNIPER_AMMO: "MUNITIONS DE SNIPER",
    GRENADE: "GRENADE",
    FULL_HP: "(SANTÉ MAX)",
    FULL_AMMO: "(PLEIN)",
    HP_SHORT: "PV",

    // Kill Types
    HEADSHOT: "HEADSHOT",
    BODYSHOT: "TIR AU CORPS",
    KILLSTREAK: "SÉRIE D'FRAGS",

    // Tips & Messages
    TIP: "ASTUCE",
    KEEP_MOVING: "BOUGEZ CONSTAMMENT ET COUVREZ-VOUS POUR RESTER EN VIE !",
    AIM_FOR_HEAD: "VISEZ LA TÊTE POUR DES DÉGÂTS BONUS !",
    RELOAD_EARLY: "RECHARGEZ AVANT D'EN AVOIR BESOIN — PAS PENDANT UN COMBAT !",
    USE_COVER: "COUVREZ-VOUS POUR OBSERVER ET TIRER — RESTEZ CACHÉ !",
    COMBO_BONUS: "COMBO PLUS ÉLEVÉ = BONUS DE SCORE PLUS GRAND !",
    ELIMINATE_ENEMIES:
      "ÉLIMINEZ TOUS LES ENNEMIS POUR PASSER À LA VAGUE SUIVANTE !",
    GET_READY: "TENEZ-VOUS PRÊT !",
    SURVIVE_STREETS: "SURVIVEZ DANS LES RUES LE PLUS LONGTEMPS POSSIBLE !",
    LOADING: "CHARGEMENT...",
    LOADING_ASSETS: "Chargement des ressources…",

    // In-game Feedback
    AMMO_OUT: "PLUS DE MUNITIONS !",
    WAVE_CLEAR: "VAGUE NETTOYÉE !",
    WAVE_COMPLETE: "VAGUE TERMINÉE",

    // Player Name
    ENTER_NAME: "SAISISSEZ VOTRE NOM",
    TYPE_NAME: "Saisir le nom",
    SAVE: "ENREGISTRER",
    EDIT_NAME: "Modifier le nom du joueur",

    // Lobby labels
    WELCOME_BACK: "Bon retour",

    // Game Over
    GO_TO_LOBBY: "RETOURNER AU SALON",
    SCORE: "SCORE",

    // Kill feedback
    HEADSHOT: "HEADSHOT !",
    BODYSHOT: "TIR AU CORPS",
    KILLSTREAK: "SÉRIE D'FRAGS",

    // Tutorial
    TUT_CAMERA_TITLE: "Visée Caméra",
    TUT_CAMERA_DESC:
      "Faites glisser l'écran pour voir les ennemis proches",
    TUT_CAMERA_TITLE2: "Visée Caméra",
    TUT_CAMERA_DESC2:
      "Déplacez votre souris pour orienter votre caméra vers les ennemis",
    TUT_ADS_TITLE: "Visée lunette",
    TUT_ADS_DESC:
      "Appuyez sur le bouton LUNETTE à gauche pour utiliser la lunette et viser précisément",
    TUT_ADS_TITLE2: "Visée de Précision",
    TUT_ADS_DESC2:
      "Maintenez le bouton DROIT de la souris enfoncé pour utiliser la lunette et viser précisément.",
    TUT_ADS_FIRE_TITLE: "Feu !",
    TUT_ADS_FIRE_DESC: "Ajustez la caméra et appuyez sur tirer pour faire feu",
    TUT_ADS_FIRE_TITLE2: "Feu !",
    TUT_ADS_FIRE_DESC2: "Faites un clic GAUCHE pour tirer !",
    TUT_JOYSTICK_AIM_TITLE: "Maintenez pour viser",
    TUT_JOYSTICK_AIM_DESC: "Maintenez le bouton de tir enfoncé pour utiliser la lunette et viser avec précision !",
    TUT_JOYSTICK_FIRE_TITLE: "Relâchez pour tirer !",
    TUT_JOYSTICK_FIRE_DESC: "Relâchez le bouton de tir pour tirer sur l'ennemi !",
    TUT_GUN_SWITCH_TITLE: "Changer d'Arme",
    TUT_GUN_SWITCH_DESC:
      "Appuyez sur le bouton de changement d'arme pour changer d'arme",
    TUT_GUN_SWITCH_TITLE2: "Changer d'Arme",
    TUT_GUN_SWITCH_DESC2: "Appuyez sur TAB ou sur les chiffres 1 ou 2, ou faites défiler la molette de votre souris pour changer d'arme",
    TUT_ELIMINATE_ALL_TITLE: "Éliminer Tout le Monde",
    TUT_ELIMINATE_ALL_DESC:
      "Les ennemis ne vous touchent que lorsque vous utilisez la lunette ou lorsque vous ratez votre tir",
    TUT_ELIMINATE_ALL_TITLE2: "Éliminer Tout le Monde",
    TUT_ELIMINATE_ALL_DESC2:
      "Les ennemis ne vous touchent que lorsque vous utilisez la lunette ou lorsque vous ratez votre tir",
    TUT_GRENADE_COLLECTED_TITLE: "Grenade Récupérée !",
    TUT_GRENADE_COLLECTED_DESC:
      "Vous avez récupéré une GRENADE ! Cela pourrait aussi être un kit de soin ou des munitions. Appuyez pour continuer",
    TUT_GRENADE_COLLECTED_TITLE2: "Grenade Récupérée !",
    TUT_GRENADE_COLLECTED_DESC2:
      "Vous avez récupéré une GRENADE ! Cela pourrait aussi être un kit de soin ou des munitions. Cliquez pour continuer",
    TUT_GRENADE_EQUIP_TITLE: "Équiper la Grenade",
    TUT_GRENADE_EQUIP_DESC:
      "Appuyez sur l'icône de GRENADE pour la prendre en main",
    TUT_GRENADE_EQUIP_TITLE2: "Équiper la Grenade",
    TUT_GRENADE_EQUIP_DESC2: "Appuyez sur la touche G ou faites défiler la molette de la souris pour prendre la grenade en main",
    TUT_GRENADE_AIM_TITLE: "Viser avec la grenade",
    TUT_GRENADE_AIM_DESC: "Maintenez le côté DROIT de l'écran pour viser la trajectoire de la grenade !",
    TUT_GRENADE_AIM_TITLE2: "Viser avec la grenade",
    TUT_GRENADE_AIM_DESC2: "Maintenez le bouton DROIT de la souris enfoncé pour viser la trajectoire de la grenade !",
    TUT_GRENADE_THROW_TITLE: "Lancer la grenade",
    TUT_GRENADE_THROW_DESC: "Relâchez pour lancer la grenade !",
    TUT_GRENADE_THROW_TITLE2: "Lancer la grenade",
    TUT_GRENADE_THROW_DESC2: "Cliquez sur le bouton GAUCHE de la souris pour lancer la grenade !",
    TUT_GRENADE_ELIMINATE_TITLE: "Éliminer Tout le Monde",
    TUT_GRENADE_ELIMINATE_DESC: "Éliminez tous les ennemis restants !",
    TUT_GRENADE_ELIMINATE_TITLE2: "Éliminer Tout le Monde",
    TUT_GRENADE_ELIMINATE_DESC2: "Éliminez tous les ennemis restants !",
    TUT_SCORE_TITLE: "Score & Éliminations",
    TUT_SCORE_DESC:
      "C'est tout ! Vous pouvez suivre votre SCORE et vos ÉLIMINATIONS ici ! Appuyez n'importe où pour continuer à jouer",
    TUT_SCORE_TITLE2: "Score & Éliminations",
    TUT_SCORE_DESC2:
      "C'est tout ! Vous pouvez suivre votre SCORE et vos ÉLIMINATIONS ici ! Cliquez n'importe où pour continuer à jouer",

    // Store
    STORE_TITLE: "MAGASIN",
    STORE_GUNS: "ARMES",
    STORE_POWERUPS: "POWER-UPS",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "FUSIL À POMPE",
    STORE_ROCKET_LAUNCHER: "LANCE-ROQUETTES",
    STORE_GRENADE: "GRENADE",
    STORE_AMMO_PACK: "PACK DE MUNITIONS",
    STORE_BUY: "ACHETER",
    STORE_OWNED: "POSSÉDÉ",
    STORE_MAX_LIMIT: "LIMITE MAX",
    STORE_CLOSE: "FERMER",
    STORE_NOT_ENOUGH_CASH: "PAS ASSEZ D'ARGENT !",
    STORE_PURCHASE_AGAIN: "Vous pourrez l'acheter à nouveau au prochain tour !",
    SELECT_WEAPONS_TITLE: "SÉLECTIONNER LES ARMES",
    SELECT_CONTINUE: "CONTINUER",

    // Weapon Names
    RIFLE: "FUSIL",
    SNIPER: "SNIPER",

    // Additional UI
    ON: "ACTIVÉ",
    OFF: "DÉSACTIVÉ",
    TIP_LABEL: "ASTUCE :",
    NEXT_WAVE: "VAGUE SUIVANTE",
    PLAYER_NAME_TITLE: "NOM DU JOUEUR",
  },

  ru: {
    // Lobby & Settings
    SETTINGS: "НАСТРОЙКИ",
    CONTROLS: "УПРАВЛЕНИЕ",
    CTRL_CLASSIC: "Классика",
    CTRL_HOLD_FIRE: "Удержание",
    SENSITIVITY: "ЧУВСТВИТЕЛЬНОСТЬ",
    MUSIC: "МУЗЫКА",
    SFX: "ЗВУКИ",
    LANGUAGE: "ЯЗЫК",
    CLOSE: "ЗАКРЫТЬ",
    START: "НАЧАТЬ",
    GO_TO_LOBBY: "В ЛОББИ",
    HIGHSCORE: "РЕКОРД",
    MAX_KILLS: "МАКС. УБИЙСТВ",
    WELCOME_BACK: "С возвращением",
    PLAYER: "ИГРОК",

    // HUD - Game
    HEALTH: "ЖИЗНЬ",
    AMMO: "ПАТРОНЫ",
    SCORE: "ОЧКИ",
    KILLS: "УБИTО",
    WAVE: "ВОЛНА",
    COMBO: "КОМБО",

    // Game Over Screen
    GAME_OVER: "ИГРА ОКОНЧЕНА",
    YOU_DIED: "ВЫ ПОГИБЛИ!",
    YOU_SURVIVED: "ВЫ ВЫЖИЛИ!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "УБИЙСТВА ИЗ ВИНТОВКИ",
    SNIPER_KILLS: "СНАЙПЕРСКИЕ УБИЙСТВА",

    // Rewarded Ad Popup
    RA_TITLE: "ПРОДОЛЖИТЬ?",
    RA_MESSAGE: "Посмотрите рекламу, чтобы восстановить здоровье и продолжить игру!",
    RA_WATCH_AD: "СМОТРЕТЬ РЕКЛАМУ",
    RA_NO_THANKS: "НЕТ, СПАСИБО",
    RA_HP_TEXT: "+100 HP",

    // Collectable Types
    MED_KIT: "АПТЕЧКА",
    RIFLE_AMMO: "ПАТРОНЫ ДЛЯ ВИНТОВКИ",
    SNIPER_AMMO: "СНАЙПЕРСКИЕ ПАТРОНЫ",
    GRENADE: "ГРАНАТА",
    FULL_HP: "(МАКС. ЖИЗНЬ)",
    FULL_AMMO: "(ПОЛНЫЙ)",
    HP_SHORT: "ОЗ",

    // Kill Types
    HEADSHOT: "ХЕДШОТ",
    BODYSHOT: "В ТЕЛО",
    KILLSTREAK: "СЕРИЯ УБИЙСТВ",

    // Tips & Messages
    TIP: "СОВЕТ",
    KEEP_MOVING: "ДВИГАЙТЕСЬ И ИСПОЛЬЗУЙТЕ УКРЫТИЯ, ЧТОБЫ ВЫЖИТЬ!",
    AIM_FOR_HEAD: "ЦЕЛЬТЕСЬ В ГОЛОВУ ДЛЯ ДОПОЛНИТЕЛЬНОГО УРОНА!",
    RELOAD_EARLY: "ПЕРЕЗАРЯЖАЙТЕСЬ ЗАРАНЕЕ — НЕ ВО ВРЕМЯ БОЯ!",
    USE_COVER:
      "ИСПОЛЬЗУЙТЕ УКРЫТИЯ, ЧТОБЫ СТРЕЛЯТЬ И ОСТАВАТЬСЯ В БЕЗОПАСНОСТИ!",
    COMBO_BONUS: "ВЫШЕ КОМБО = БОЛЬШЕ БОНУСНЫХ ОЧКОВ!",
    ELIMINATE_ENEMIES: "УНИЧТОЖЬТЕ ВСЕХ ВРАГОВ, ЧТОБЫ НАЧАТЬ СЛЕДУЮЩУЮ ВОЛНУ!",
    GET_READY: "ПРИГОТОВИТЬСЯ!",
    SURVIVE_STREETS: "ВЫЖИВАЙТЕ НА УЛИЦАХ КАК МОЖНО ДОЛЬШЕ!",
    LOADING: "ЗАГРУЗКА...",
    LOADING_ASSETS: "Загрузка ресурсов…",

    // In-game Feedback
    AMMO_OUT: "КОНЧИЛИСЬ ПАТРОНЫ!",
    WAVE_CLEAR: "ВОЛНА ЗАЧИЩЕНА!",
    WAVE_COMPLETE: "ВОЛНА ПРОЙДЕНА",

    // Player Name
    ENTER_NAME: "ВВЕДИТЕ ИМЯ",
    TYPE_NAME: "Введите имя",
    SAVE: "СОХРАНИТЬ",
    EDIT_NAME: "Изменить имя игрока",

    // Lobby labels
    WELCOME_BACK: "С возвращением",

    // Game Over
    GO_TO_LOBBY: "В ЛОББИ",
    SCORE: "ОЧКИ",

    // Kill feedback
    HEADSHOT: "ХЕДШОТ!",
    BODYSHOT: "В ТЕЛО",
    KILLSTREAK: "СЕРИЯ УБИЙСТВ",

    // Tutorial
    TUT_CAMERA_TITLE: "Прицел камеры",
    TUT_CAMERA_DESC:
      "Проведите по экрану, чтобы увидеть врагов поблизости",
    TUT_CAMERA_TITLE2: "Прицел камеры",
    TUT_CAMERA_DESC2: "Двигайте мышь, чтобы направить камеру на врагов",
    TUT_ADS_TITLE: "Прицеливание через оптику",
    TUT_ADS_DESC:
      "Нажмите кнопку прицела слева, чтобы войти в режим прицеливания и целиться точнее",
    TUT_ADS_TITLE2: "Точное прицеливание",
    TUT_ADS_DESC2:
      "Зажмите ПРАВУЮ кнопку мыши, чтобы прицелиться через оптику и целиться точнее.",
    TUT_ADS_FIRE_TITLE: "Огонь!",
    TUT_ADS_FIRE_DESC: "Настройте камеру и нажмите кнопку выстрела, чтобы открыть огонь",
    TUT_ADS_FIRE_TITLE2: "Огонь!",
    TUT_ADS_FIRE_DESC2: "Нажмите ЛЕВУЮ кнопку мыши, чтобы выстрелить!",
    TUT_JOYSTICK_AIM_TITLE: "Удерживайте для прицеливания",
    TUT_JOYSTICK_AIM_DESC: "Удерживайте кнопку стрельбы, чтобы прицелиться!",
    TUT_JOYSTICK_FIRE_TITLE: "Отпустите для стрельбы!",
    TUT_JOYSTICK_FIRE_DESC: "Отпустите кнопку стрельбы, чтобы выстрелить в врага!",
    TUT_GUN_SWITCH_TITLE: "Сменить оружие",
    TUT_GUN_SWITCH_DESC: "Нажмите кнопку смены оружия, чтобы переключить его",
    TUT_GUN_SWITCH_TITLE2: "Сменить оружие",
    TUT_GUN_SWITCH_DESC2: "Нажмите TAB, клавиши 1 или 2, либо прокрутите колесико мыши для смены оружия",
    TUT_ELIMINATE_ALL_TITLE: "Уничтожить всех",
    TUT_ELIMINATE_ALL_DESC:
      "Враги попадают в вас только тогда, когда вы целитесь через прицел или промахиваетесь",
    TUT_ELIMINATE_ALL_TITLE2: "Уничтожить всех",
    TUT_ELIMINATE_ALL_DESC2:
      "Враги попадают в вас только тогда, когда вы целитесь через прицел или промахиваетесь",
    TUT_GRENADE_COLLECTED_TITLE: "Граната получена!",
    TUT_GRENADE_COLLECTED_DESC:
      "Вы подобрали ГРАНАТУ! Это также могла быть аптечка или патроны. Нажмите для продолжения",
    TUT_GRENADE_COLLECTED_TITLE2: "Граната получена!",
    TUT_GRENADE_COLLECTED_DESC2:
      "Вы подобрали ГРАНАТУ! Это также могла быть аптечка или патроны. Нажмите для продолжения",
    TUT_GRENADE_EQUIP_TITLE: "Взять гранату",
    TUT_GRENADE_EQUIP_DESC: "Нажмите на иконку ГРАНАТЫ, чтобы взять её в руку",
    TUT_GRENADE_EQUIP_TITLE2: "Взять гранату",
    TUT_GRENADE_EQUIP_DESC2: "Нажмите клавишу G или прокрутите колесико мыши, чтобы взять гранату в руку",
    TUT_GRENADE_AIM_TITLE: "Прицеливание гранаты",
    TUT_GRENADE_AIM_DESC: "Удерживайте нажатие на ПРАВОЙ части экрана, чтобы прицелиться по траектории гранаты!",
    TUT_GRENADE_AIM_TITLE2: "Прицеливание гранаты",
    TUT_GRENADE_AIM_DESC2: "Зажмите ПРАВУЮ кнопку мыши, чтобы прицелиться по траектории гранаты!",
    TUT_GRENADE_THROW_TITLE: "Бросить гранату",
    TUT_GRENADE_THROW_DESC: "Отпустите, чтобы бросить гранату!",
    TUT_GRENADE_THROW_TITLE2: "Бросить гранату",
    TUT_GRENADE_THROW_DESC2: "Нажмите ЛЕВУЮ кнопку мыши, чтобы бросить гранату!",
    TUT_GRENADE_ELIMINATE_TITLE: "Уничтожить всех",
    TUT_GRENADE_ELIMINATE_DESC: "Уничтожьте всех оставшихся врагов!",
    TUT_GRENADE_ELIMINATE_TITLE2: "Уничтожить всех",
    TUT_GRENADE_ELIMINATE_DESC2: "Уничтожьте всех оставшихся врагов!",
    TUT_SCORE_TITLE: "Счет и убийства",
    TUT_SCORE_DESC:
      "Вот и все! Вы можете отслеживать свой СЧЕТ и УБИЙСТВА здесь! Нажмите в любом месте, чтобы продолжить игру",
    TUT_SCORE_TITLE2: "Счет и убийства",
    TUT_SCORE_DESC2:
      "Вот и все! Вы можете отслеживать свой СЧЕТ и УБИЙСТВА здесь! Нажмите в любом месте, чтобы продолжить игру",

    // Store
    STORE_TITLE: "МАГАЗИН",
    STORE_GUNS: "ОРУЖИЕ",
    STORE_POWERUPS: "УСИЛЕНИЯ",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "ДРОБОВИК",
    STORE_ROCKET_LAUNCHER: "РАКЕТОМЕТ",
    STORE_GRENADE: "ГРАНАТА",
    STORE_AMMO_PACK: "ПАЧКА ПАТРОНОВ",
    STORE_BUY: "КУПИТЬ",
    STORE_OWNED: "КУПЛЕНО",
    STORE_MAX_LIMIT: "МАКС. ЛИМИТ",
    STORE_CLOSE: "ЗАКРЫТЬ",
    STORE_NOT_ENOUGH_CASH: "НЕДОСТАТОЧНО ДЕНЕГ!",
    STORE_PURCHASE_AGAIN: "Вы сможете купить это снова в следующем раунде!",
    SELECT_WEAPONS_TITLE: "ВЫБОР ОРУЖИЯ",
    SELECT_CONTINUE: "ПРОДОЛЖИТЬ",

    // Weapon Names
    RIFLE: "ВИНТОВКА",
    SNIPER: "СНАЙПЕР",

    // Additional UI
    ON: "ВКЛ",
    OFF: "ВЫКЛ",
    TIP_LABEL: "СОВЕТ:",
    NEXT_WAVE: "СЛЕДУЮЩАЯ ВОЛНА",
    PLAYER_NAME_TITLE: "ИМЯ ИГРОКА",
  },

  id: {
    // Lobby & Settings
    SETTINGS: "PENGATURAN",
    CONTROLS: "KONTROL",
    CTRL_CLASSIC: "Klasik",
    CTRL_HOLD_FIRE: "Tahan-Tembak",
    SENSITIVITY: "SENSITIVITAS",
    MUSIC: "MUSIK",
    SFX: "SFX",
    LANGUAGE: "BAHASA",
    CLOSE: "TUTUP",
    START: "MULAI",
    GO_TO_LOBBY: "KE LOBBY",
    HIGHSCORE: "SKOR TERTINGGI",
    MAX_KILLS: "KILL MAKSIMAL",
    WELCOME_BACK: "Selamat Datang Kembali",
    PLAYER: "PEMAIN",

    // HUD - Game
    HEALTH: "DARAH",
    AMMO: "AMUNISI",
    SCORE: "SKOR",
    KILLS: "KILL",
    WAVE: "GELOMBANG",
    COMBO: "KOMBO",

    // Game Over Screen
    GAME_OVER: "GAME OVER",
    YOU_DIED: "KAMU MATI!",
    YOU_SURVIVED: "KAMU BERTAHAN!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "RIFLE KILL",
    SNIPER_KILLS: "SNIPER KILL",

    // Rewarded Ad Popup
    RA_TITLE: "LANJUTKAN?",
    RA_MESSAGE: "Tonton iklan untuk memulihkan HP dan melanjutkan permainan!",
    RA_WATCH_AD: "TONTON IKLAN",
    RA_NO_THANKS: "TIDAK, TERIMA KASIH",
    RA_HP_TEXT: "+100 HP",

    // Collectable Types
    MED_KIT: "MED KIT",
    RIFLE_AMMO: "AMUNISI RIFLE",
    SNIPER_AMMO: "AMUNISI SNIPER",
    GRENADE: "GRANAT",
    FULL_HP: "(DARAH PENUH)",
    FULL_AMMO: "(PENUH)",
    HP_SHORT: "HP",

    // Kill Types
    HEADSHOT: "HEADSHOT",
    BODYSHOT: "BODYSHOT",
    KILLSTREAK: "KILLSTREAK",

    // Tips & Messages
    TIP: "TIPS",
    KEEP_MOVING:
      "TERUS BERGERAK DAN GUNAKAN PERLINDUNGAN UNTUK BERTAHAN HIDUP!",
    AIM_FOR_HEAD: "BIDIK KEPALA UNTUK BONUS DAMAGE!",
    RELOAD_EARLY: "RELOAD SEBELUM HABIS — JANGAN SAAT BERTEMPUR!",
    USE_COVER:
      "GUNAKAN PERLINDUNGAN UNTUK MENGINTIP DAN MENEMBAK — TETAP SEMBUNYI!",
    COMBO_BONUS: "KOMBO LEBIH TINGGI = BONUS SKOR LEBIH BESAR!",
    ELIMINATE_ENEMIES:
      "ELIMINASI SEMUA MUSUH UNTUK LANJUT KE GELOMBANG BERIKUTNYA!",
    GET_READY: "BERSIAPLAH!",
    SURVIVE_STREETS: "BERTAHANLAH DI JALANAN SELAMA MUNGKIN!",
    LOADING: "MEMUAT...",
    LOADING_ASSETS: "Memuat aset…",

    // In-game Feedback
    AMMO_OUT: "AMUNISI HABIS!",
    WAVE_CLEAR: "GELOMBANG BERSIH!",
    WAVE_COMPLETE: "GELOMBANG SELESAI",

    // Player Name
    ENTER_NAME: "MASUKKAN NAMAMU",
    TYPE_NAME: "Ketik nama",
    SAVE: "SIMPAN",
    EDIT_NAME: "Edit nama pemain",

    // Lobby labels
    WELCOME_BACK: "Selamat Datang Kembali",

    // Game Over
    GO_TO_LOBBY: "KE LOBBY",
    SCORE: "SKOR",

    // Kill feedback
    HEADSHOT: "HEADSHOT!",
    BODYSHOT: "BODYSHOT",
    KILLSTREAK: "KILLSTREAK",

    // Tutorial
    TUT_CAMERA_TITLE: "Arah Kamera",
    TUT_CAMERA_DESC:
      "Seret layar untuk melihat musuh di dekatmu",
    TUT_CAMERA_TITLE2: "Arah Kamera",
    TUT_CAMERA_DESC2: "Gerakkan mouse Anda untuk mengarahkan kamera ke musuh",
    TUT_ADS_TITLE: "Bidikan Keker",
    TUT_ADS_DESC:
      "Ketuk tombol KEKER di sebelah kiri untuk membidik menggunakan keker dan membidik dengan tepat",
    TUT_ADS_TITLE2: "Bidikan Presisi",
    TUT_ADS_DESC2:
      "Tahan tombol klik KANAN untuk membidik menggunakan keker dan membidik dengan tepat.",
    TUT_ADS_FIRE_TITLE: "Tembak!",
    TUT_ADS_FIRE_DESC: "Sesuaikan kamera dan ketuk tembak untuk menembak",
    TUT_ADS_FIRE_TITLE2: "Tembak!",
    TUT_ADS_FIRE_DESC2: "Klik tombol KIRI untuk menembak!",
    TUT_JOYSTICK_AIM_TITLE: "Tahan untuk Membidik",
    TUT_JOYSTICK_AIM_DESC: "Tahan tombol tembak untuk menggunakan scope dan membidik dengan akurat!",
    TUT_JOYSTICK_FIRE_TITLE: "Lepaskan untuk Menembak!",
    TUT_JOYSTICK_FIRE_DESC: "Lepaskan tombol tembak untuk menembak musuh!",
    TUT_GUN_SWITCH_TITLE: "Ganti Senjata",
    TUT_GUN_SWITCH_DESC: "Ketuk tombol ganti senjata untuk mengubah senjata",
    TUT_GUN_SWITCH_TITLE2: "Ganti Senjata",
    TUT_GUN_SWITCH_DESC2: "Tekan TAB atau angka 1 atau 2 atau gulir roda mouse Anda untuk mengganti senjata",
    TUT_ELIMINATE_ALL_TITLE: "Habisi Semua",
    TUT_ELIMINATE_ALL_DESC:
      "Musuh hanya mengenai Anda saat Anda membidik dengan keker atau ketika tembakan Anda meleset",
    TUT_ELIMINATE_ALL_TITLE2: "Habisi Semua",
    TUT_ELIMINATE_ALL_DESC2:
      "Musuh hanya mengenai Anda saat Anda membidik dengan keker atau ketika tembakan Anda meleset",
    TUT_GRENADE_COLLECTED_TITLE: "Granat Diambil!",
    TUT_GRENADE_COLLECTED_DESC:
      "Anda mendapatkan GRANAT! Ini bisa juga berupa Medkit atau Amunisi. Ketuk untuk melanjutkan",
    TUT_GRENADE_COLLECTED_TITLE2: "Granat Diambil!",
    TUT_GRENADE_COLLECTED_DESC2:
      "Anda mendapatkan GRANAT! Ini bisa juga berupa Medkit atau Amunisi. Klik untuk melanjutkan",
    TUT_GRENADE_EQUIP_TITLE: "Gunakan Granat",
    TUT_GRENADE_EQUIP_DESC:
      "Ketuk ikon GRANAT untuk menggenggamnya di tangan Anda",
    TUT_GRENADE_EQUIP_TITLE2: "Gunakan Granat",
    TUT_GRENADE_EQUIP_DESC2: "Tekan tombol G atau gulir roda mouse untuk menggenggam granat di tangan Anda",
    TUT_GRENADE_AIM_TITLE: "Bidik Granat",
    TUT_GRENADE_AIM_DESC: "Tahan sisi KANAN layar untuk membidik lintasan granat!",
    TUT_GRENADE_AIM_TITLE2: "Bidik Granat",
    TUT_GRENADE_AIM_DESC2: "Tahan tombol klik KANAN untuk membidik lintasan granat!",
    TUT_GRENADE_THROW_TITLE: "Lempar Granat",
    TUT_GRENADE_THROW_DESC: "Lepaskan untuk melempar granat!",
    TUT_GRENADE_THROW_TITLE2: "Lempar Granat",
    TUT_GRENADE_THROW_DESC2: "Klik tombol KIRI mouse untuk melempar granat!",
    TUT_GRENADE_ELIMINATE_TITLE: "Habisi Semua",
    TUT_GRENADE_ELIMINATE_DESC: "Habisi semua musuh yang tersisa!",
    TUT_GRENADE_ELIMINATE_TITLE2: "Habisi Semua",
    TUT_GRENADE_ELIMINATE_DESC2: "Habisi semua musuh yang tersisa!",
    TUT_SCORE_TITLE: "Skor & Kill",
    TUT_SCORE_DESC:
      "Itu saja! Anda bisa memantau SKOR dan KILL Anda di sini! Ketuk di mana saja untuk melanjutkan permainan",
    TUT_SCORE_TITLE2: "Skor & Kill",
    TUT_SCORE_DESC2:
      "Itu saja! Anda bisa memantau SKOR dan KILL Anda di sini! Klik di mana saja untuk melanjutkan permainan",

    // Store
    STORE_TITLE: "TOKO",
    STORE_GUNS: "SENJATA",
    STORE_POWERUPS: "POWER-UP",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "SHOTGUN",
    STORE_ROCKET_LAUNCHER: "PELUNCUR ROKET",
    STORE_GRENADE: "GRANAT",
    STORE_AMMO_PACK: "PAKET AMUNISI",
    STORE_BUY: "BELI",
    STORE_OWNED: "DIMILIKI",
    STORE_MAX_LIMIT: "BATAS MAKSIMAL",
    STORE_CLOSE: "TUTUP",
    STORE_NOT_ENOUGH_CASH: "UANG TIDAK CUKUP!",
    STORE_PURCHASE_AGAIN: "Anda dapat membelinya lagi di babak berikutnya!",
    SELECT_WEAPONS_TITLE: "PILIH SENJATA",
    SELECT_CONTINUE: "LANJUTKAN",

    // Weapon Names
    RIFLE: "SENAPAN",
    SNIPER: "SNIPER",

    // Additional UI
    ON: "AKTIF",
    OFF: "NONAKTIF",
    TIP_LABEL: "TIPS:",
    NEXT_WAVE: "GELOMBANG BERIKUTNYA",
    PLAYER_NAME_TITLE: "NAMA PEMAIN",
  },

  de: {
    // Lobby & Settings
    SETTINGS: "EINSTELLUNGEN",
    CONTROLS: "STEUERUNG",
    CTRL_CLASSIC: "Klassisch",
    CTRL_HOLD_FIRE: "Halten-Feuern",
    SENSITIVITY: "EMPFINDLICHKEIT",
    MUSIC: "MUSIK",
    SFX: "SFX",
    LANGUAGE: "SPRACHE",
    CLOSE: "SCHLIESSEN",
    START: "START",
    GO_TO_LOBBY: "ZUR LOBBY",
    HIGHSCORE: "BESTLEISTUNG",
    MAX_KILLS: "MAX. KILLS",
    WELCOME_BACK: "Willkommen zurück",
    PLAYER: "SPIELER",

    // HUD - Game
    HEALTH: "HP",
    AMMO: "MUNITION",
    SCORE: "PUNKTE",
    KILLS: "KILLS",
    WAVE: "WELLE",
    COMBO: "COMBO",

    // Game Over Screen
    GAME_OVER: "GAME OVER",
    YOU_DIED: "DU BIST GESTORBEN!",
    YOU_SURVIVED: "DU HAST ÜBERLEBT!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "GEWEHR-KILLS",
    SNIPER_KILLS: "SNIPER-KILLS",

    // Rewarded Ad Popup
    RA_TITLE: "FORTSETZEN?",
    RA_MESSAGE: "Sieh dir eine Werbung an, um deine Gesundheit wiederherzustellen und weiterzuspielen!",
    RA_WATCH_AD: "WERBUNG ANSEHEN",
    RA_NO_THANKS: "NEIN, DANKE",
    RA_HP_TEXT: "+100 HP",

    // Collectable Types
    MED_KIT: "MEDIKIT",
    RIFLE_AMMO: "GEWEHRMUNITION",
    SNIPER_AMMO: "SNIPERMUNITION",
    GRENADE: "GRANATE",
    FULL_HP: "(VOLL)",
    FULL_AMMO: "(VOLL)",
    HP_SHORT: "HP",

    // Kill Types
    HEADSHOT: "HEADSHOT",
    BODYSHOT: "KÖRPERTREFFER",
    KILLSTREAK: "KILLSTREAK",

    // Tips & Messages
    TIP: "TIPP",
    KEEP_MOVING: "BLEIB IN BEWEGUNG UND NUTZE DECKUNG, UM ZU ÜBERLEBEN!",
    AIM_FOR_HEAD: "ZIELE AUF DEN KOPF FÜR BONUSSCHADEN!",
    RELOAD_EARLY: "LADE FRÜHZEITIG NACH — NICHT ERST IM KAMPF!",
    USE_COVER: "NUTZE DECKUNG ZUM SPÄHEN UND SCHIESSEN — BLEIB VERSTECKT!",
    COMBO_BONUS: "HÖHERE COMBO = GRÖSSERER PUNKTEBONUS!",
    ELIMINATE_ENEMIES: "ELIMINIERE ALLE FEINDE, UM NÄCHSTE WELLE ZU ERREICHEN!",
    GET_READY: "MACH DICH BEREIT!",
    SURVIVE_STREETS: "ÜBERLEBE AUF DEN STRASSEN SO LANGE WIE MÖGLICH!",
    LOADING: "LÄDT...",
    LOADING_ASSETS: "Ressourcen werden geladen...",

    // In-game Feedback
    AMMO_OUT: "MUNITION LEER!",
    WAVE_CLEAR: "WELLE GEKLÄRT!",
    WAVE_COMPLETE: "WELLE BEENDET",

    // Player Name
    ENTER_NAME: "NAME EINGEBEN",
    TYPE_NAME: "Name eingeben",
    SAVE: "SPEICHERN",
    EDIT_NAME: "Spielernamen bearbeiten",

    // Lobby labels
    WELCOME_BACK: "Willkommen zurück",

    // Game Over
    GO_TO_LOBBY: "ZUR LOBBY",
    SCORE: "PUNKTE",

    // Kill feedback
    HEADSHOT: "HEADSHOT!",
    BODYSHOT: "KÖRPERTREFFER",
    KILLSTREAK: "KILLSTREAK",

    // Tutorial
    TUT_CAMERA_TITLE: "Kameraziel",
    TUT_CAMERA_DESC:
      "Ziehe über den Bildschirm, um nahe Gegner zu sehen",
    TUT_CAMERA_TITLE2: "Kameraziel",
    TUT_CAMERA_DESC2:
      "Bewege deine Maus, um die Kamera auf die Gegner zu richten",
    TUT_ADS_TITLE: "Visier-Zielen",
    TUT_ADS_DESC:
      "Tippe auf die VISIER-Schaltfläche links, um durch das Visier zu schauen und präzise zu zielen",
    TUT_ADS_TITLE2: "Präzisionsziel",
    TUT_ADS_DESC2:
      "Halte die RECHTE Maustaste gedrückt, um durch das Visier zu schauen und präzise zu zielen.",
    TUT_ADS_FIRE_TITLE: "Feuer!",
    TUT_ADS_FIRE_DESC: "Richte die Kamera aus und tippe auf Feuern, um zu schießen",
    TUT_ADS_FIRE_TITLE2: "Feuer!",
    TUT_ADS_FIRE_DESC2: "Klicke mit der LINKEN Maustaste zum Schießen!",
    TUT_JOYSTICK_AIM_TITLE: "Halten zum Zielen",
    TUT_JOYSTICK_AIM_DESC: "Halte die Feuertaste gedrückt, um zu zielen!",
    TUT_JOYSTICK_FIRE_TITLE: "Loslassen zum Schießen!",
    TUT_JOYSTICK_FIRE_DESC: "Lasse die Feuertaste los, um auf den Feind zu schießen!",
    TUT_GUN_SWITCH_TITLE: "Waffe wechseln",
    TUT_GUN_SWITCH_DESC:
      "Tippe auf die Taste zum Waffenwechsel, um deine Waffe zu wechseln",
    TUT_GUN_SWITCH_TITLE2: "Waffe wechseln",
    TUT_GUN_SWITCH_DESC2: "Drücke TAB, die Tasten 1 oder 2 oder drehe das Mausrad, um die Waffe zu wechseln",
    TUT_ELIMINATE_ALL_TITLE: "Alle eliminieren",
    TUT_ELIMINATE_ALL_DESC:
      "Gegner treffen dich nur, während du durch das Visier schaust oder wenn du deinen Schuss verfehlst",
    TUT_ELIMINATE_ALL_TITLE2: "Alle eliminieren",
    TUT_ELIMINATE_ALL_DESC2:
      "Gegner treffen dich nur, während du durch das Visier schaust oder wenn du deinen Schuss verfehlst",
    TUT_GRENADE_COLLECTED_TITLE: "Granate eingesammelt!",
    TUT_GRENADE_COLLECTED_DESC:
      "Du hast eine GRANATE eingesammelt! Es könnte auch ein Medikit oder Munition sein. Zum Fortfahren tippen",
    TUT_GRENADE_COLLECTED_TITLE2: "Granate eingesammelt!",
    TUT_GRENADE_COLLECTED_DESC2:
      "Du hast eine GRANATE eingesammelt! Es könnte auch ein Medikit oder Munition sein. Zum Fortfahren klicken",
    TUT_GRENADE_EQUIP_TITLE: "Granate ausrüsten",
    TUT_GRENADE_EQUIP_DESC:
      "Tippe auf das GRANATEN-Symbol, um sie in die Hand zu nehmen",
    TUT_GRENADE_EQUIP_TITLE2: "Granate ausrüsten",
    TUT_GRENADE_EQUIP_DESC2: "Drücke die G-Taste oder drehe das Mausrad, um die Granate in die Hand zu nehmen",
    TUT_GRENADE_AIM_TITLE: "Granate zielen",
    TUT_GRENADE_AIM_DESC: "Halte die RECHTE Seite des Bildschirms gedrückt, um die Flugbahn der Granate anzuvisieren!",
    TUT_GRENADE_AIM_TITLE2: "Granate zielen",
    TUT_GRENADE_AIM_DESC2: "Halte die RECHTE Maustaste gedrückt, um die Flugbahn der Granate anzuvisieren!",
    TUT_GRENADE_THROW_TITLE: "Granate werfen",
    TUT_GRENADE_THROW_DESC: "Loslassen, um die Granate zu werfen!",
    TUT_GRENADE_THROW_TITLE2: "Granate werfen",
    TUT_GRENADE_THROW_DESC2: "Klicke mit der LINKEN Maustaste, um die Granate zu werfen!",
    TUT_GRENADE_ELIMINATE_TITLE: "Alle eliminieren",
    TUT_GRENADE_ELIMINATE_DESC: "Eliminiere alle verbleibenden Gegner!",
    TUT_GRENADE_ELIMINATE_TITLE2: "Alle eliminieren",
    TUT_GRENADE_ELIMINATE_DESC2: "Eliminiere alle verbleibenden Gegner!",
    TUT_SCORE_TITLE: "Punkte & Kills",
    TUT_SCORE_DESC:
      "Das ist alles! Du kannst deine PUNKTE und KILLS hier verfolgen! Tippe irgendwo hin, um weiterzuspielen",
    TUT_SCORE_TITLE2: "Punkte & Kills",
    TUT_SCORE_DESC2:
      "Das ist alles! Du kannst deine PUNKTE und KILLS hier verfolgen! Klicke irgendwo hin, um weiterzuspielen",

    // Store
    STORE_TITLE: "SHOP",
    STORE_GUNS: "WAFFEN",
    STORE_POWERUPS: "POWER-UPS",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "SCHROTFLINTE",
    STORE_ROCKET_LAUNCHER: "RAKETENWERFER",
    STORE_GRENADE: "GRANATE",
    STORE_AMMO_PACK: "MUNITIONSPAKET",
    STORE_BUY: "KAUFEN",
    STORE_OWNED: "IM BESITZ",
    STORE_MAX_LIMIT: "MAX. LIMIT",
    STORE_CLOSE: "SCHLIESSEN",
    STORE_NOT_ENOUGH_CASH: "NICHT GENUG GELD!",
    STORE_PURCHASE_AGAIN: "Du kannst es in der nächsten Runde erneut kaufen!",
    SELECT_WEAPONS_TITLE: "WAFFEN AUSWÄHLEN",
    SELECT_CONTINUE: "FORTSETZEN",

    // Weapon Names
    RIFLE: "GEWEHR",
    SNIPER: "SCHARFSCHÜTZENGEWEHR",

    // Additional UI
    ON: "AN",
    OFF: "AUS",
    TIP_LABEL: "TIPP:",
    NEXT_WAVE: "NÄCHSTE WELLE",
    PLAYER_NAME_TITLE: "SPIELERNAME",
  },

  ja: {
    // Lobby & Settings
    SETTINGS: "設定",
    CONTROLS: "操作方法",
    CTRL_CLASSIC: "クラシック",
    CTRL_HOLD_FIRE: "長押し射撃",
    SENSITIVITY: "感度",
    MUSIC: "音楽",
    SFX: "効果音",
    LANGUAGE: "言語",
    CLOSE: "閉じる",
    START: "スタート",
    GO_TO_LOBBY: "ロビーへ移動",
    HIGHSCORE: "最高スコア",
    MAX_KILLS: "最大キル数",
    WELCOME_BACK: "おかえりなさい",
    PLAYER: "プレイヤー",

    // HUD - Game
    HEALTH: "体力",
    AMMO: "弾薬",
    SCORE: "スコア",
    KILLS: "キル",
    WAVE: "ウェーブ",
    COMBO: "コンボ",

    // Game Over Screen
    GAME_OVER: "ゲームオーバー",
    YOU_DIED: "死亡しました！",
    YOU_SURVIVED: "生き残った！",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "ライフルキル",
    SNIPER_KILLS: "スナイパーキル",

    // Rewarded Ad Popup
    RA_TITLE: "コンティニュー？",
    RA_MESSAGE: "広告を視聴してHPを回復し、プレイを続けましょう！",
    RA_WATCH_AD: "広告を見る",
    RA_NO_THANKS: "いいえ、結構です",
    RA_HP_TEXT: "+100 HP",

    // Collectable Types
    MED_KIT: "医療キット",
    RIFLE_AMMO: "ライフル弾薬",
    SNIPER_AMMO: "スナイパー弾薬",
    GRENADE: "手榴弾",
    FULL_HP: "(体力マックス)",
    FULL_AMMO: "(満杯)",
    HP_SHORT: "HP",

    // Kill Types
    HEADSHOT: "ヘッドショット",
    BODYSHOT: "ボディショット",
    KILLSTREAK: "キルストリーク",

    // Tips & Messages
    TIP: "ヒント",
    KEEP_MOVING: "生き残るために動き続け、遮蔽物を利用しろ！",
    AIM_FOR_HEAD: "頭を狙ってボーナスダメージを与えろ！",
    RELOAD_EARLY: "戦闘中ではなく、必要になる前にリロードしろ！",
    USE_COVER: "遮蔽物を利用して狙い撃ち、隠れ続けろ！",
    COMBO_BONUS: "コンボが高いほど、スコアボーナスが大きくなる！",
    ELIMINATE_ENEMIES: "次のウェーブへ進むためにすべての敵を排除しろ！",
    GET_READY: "準備しろ！",
    SURVIVE_STREETS: "できるだけ長くストリートを生き残れ！",
    LOADING: "ロード中...",
    LOADING_ASSETS: "アセットをロード中...",

    // In-game Feedback
    AMMO_OUT: "弾薬切れ！",
    WAVE_CLEAR: "ウェーブクリア！",
    WAVE_COMPLETE: "ウェーブ完了",

    // Player Name
    ENTER_NAME: "名前を入力",
    TYPE_NAME: "名前を入力してください",
    SAVE: "保存",
    EDIT_NAME: "プレイヤー名を編集",

    // Lobby labels
    WELCOME_BACK: "おかえりなさい",

    // Game Over
    GO_TO_LOBBY: "ロビーへ移動",
    SCORE: "スコア",

    // Kill feedback
    HEADSHOT: "ヘッドショット！",
    BODYSHOT: "ボディショット",
    KILLSTREAK: "キルストリーク",

    // Tutorial
    TUT_CAMERA_TITLE: "カメラエイム",
    TUT_CAMERA_DESC:
      "画面をドラッグして近くの敵を確認します",
    TUT_CAMERA_TITLE2: "カメラエイム",
    TUT_CAMERA_DESC2: "マウスを動かして敵にカメラを向けます",
    TUT_ADS_TITLE: "スコープエイム",
    TUT_ADS_DESC:
      "左側のスコープボタンをタップしてスコープをのぞき、精密に狙います",
    TUT_ADS_TITLE2: "精密照準",
    TUT_ADS_DESC2:
      "右クリックボタンを長押ししてスコープをのぞき、精密に狙います。",
    TUT_ADS_FIRE_TITLE: "ファイア！",
    TUT_ADS_FIRE_DESC: "カメラを調整し、射撃ボタンをタップして撃ちます",
    TUT_ADS_FIRE_TITLE2: "ファイア！",
    TUT_ADS_FIRE_DESC2: "左クリックで発射！",
    TUT_JOYSTICK_AIM_TITLE: "長押しでエイム",
    TUT_JOYSTICK_AIM_DESC: "射撃ボタンを長押ししてスコープを覗き、正確に狙います！",
    TUT_JOYSTICK_FIRE_TITLE: "離して射撃！",
    TUT_JOYSTICK_FIRE_DESC: "射撃ボタンを離して敵を撃ちます！",
    TUT_GUN_SWITCH_TITLE: "武器の切り替え",
    TUT_GUN_SWITCH_DESC: "武器切り替えボタンをタップして武器を変更します",
    TUT_GUN_SWITCH_TITLE2: "武器の切り替え",
    TUT_GUN_SWITCH_DESC2: "TABキー、数字の1もしくは2を押すか、マウスホイールをスクロールして武器を変更します",
    TUT_ELIMINATE_ALL_TITLE: "敵を全員排除",
    TUT_ELIMINATE_ALL_DESC:
      "敵は、スコープをのぞいている時、または射撃を外した時にのみ攻撃を当ててきます",
    TUT_ELIMINATE_ALL_TITLE2: "敵を全員排除",
    TUT_ELIMINATE_ALL_DESC2:
      "敵は、スコープをのぞいている時、または射撃を外した時にのみ攻撃を当ててきます",
    TUT_GRENADE_COLLECTED_TITLE: "グレネード回収！",
    TUT_GRENADE_COLLECTED_DESC:
      "グレネードを回収しました！メディキットや弾薬の場合もあります。タップして続行",
    TUT_GRENADE_COLLECTED_TITLE2: "グレネード回収！",
    TUT_GRENADE_COLLECTED_DESC2:
      "グレネードを回収しました！メディキットや弾薬の場合もあります。クリックして続行",
    TUT_GRENADE_EQUIP_TITLE: "グレネードを装備",
    TUT_GRENADE_EQUIP_DESC: "グレネードアイコンをタップして手に装備します",
    TUT_GRENADE_EQUIP_TITLE2: "グレネードを装備",
    TUT_GRENADE_EQUIP_DESC2: "Gキーを押すかマウスホイールをスクロールしてグレネードを手に装備します",
    TUT_GRENADE_AIM_TITLE: "グレネードを狙う",
    TUT_GRENADE_AIM_DESC: "画面の右側を長押ししてグレネードの軌道を狙います！",
    TUT_GRENADE_AIM_TITLE2: "グレネードを狙う",
    TUT_GRENADE_AIM_DESC2: "右クリックボタンを長押ししてグレネード의 궤도를狙います！",
    TUT_GRENADE_THROW_TITLE: "グレネードを投げる",
    TUT_GRENADE_THROW_DESC: "指を離してグレネードを投げます！",
    TUT_GRENADE_THROW_TITLE2: "グレネードを投げる",
    TUT_GRENADE_THROW_DESC2: "マウスの左ボタンをクリックしてグレネードを投げます！",
    TUT_GRENADE_ELIMINATE_TITLE: "敵を全員排除",
    TUT_GRENADE_ELIMINATE_DESC: "残りの敵をすべて排除してください！",
    TUT_GRENADE_ELIMINATE_TITLE2: "敵を全員排除",
    TUT_GRENADE_ELIMINATE_DESC2: "残りの敵をすべて排除してください！",
    TUT_SCORE_TITLE: "スコア＆キル数",
    TUT_SCORE_DESC:
      "以上です！ここでスコアとキル数を追跡できます！どこでもタップしてプレイを続行します",
    TUT_SCORE_TITLE2: "スコア＆キル数",
    TUT_SCORE_DESC2:
      "以上です！ここでスコアとキル数を追跡できます！どこでもクリックしてプレイを続行します",

    // Store
    STORE_TITLE: "ショップ",
    STORE_GUNS: "武器",
    STORE_POWERUPS: "パワーアップ",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "ショットガン",
    STORE_ROCKET_LAUNCHER: "ロケットランチャー",
    STORE_GRENADE: "手榴弾",
    STORE_AMMO_PACK: "弾薬パック",
    STORE_BUY: "購入",
    STORE_OWNED: "所持中",
    STORE_MAX_LIMIT: "上限到達",
    STORE_CLOSE: "閉じる",
    STORE_NOT_ENOUGH_CASH: "所持金が足りません！",
    STORE_PURCHASE_AGAIN: "次のラウンドで再び購入できます！",
    SELECT_WEAPONS_TITLE: "武器選択",
    SELECT_CONTINUE: "続ける",

    // Weapon Names
    RIFLE: "ライフル",
    SNIPER: "スナイパー",

    // Additional UI
    ON: "オン",
    OFF: "オフ",
    TIP_LABEL: "ヒント:",
    NEXT_WAVE: "次のウェーブ",
    PLAYER_NAME_TITLE: "プレイヤー名",
  },

  tr: {
    // Lobby & Settings
    SETTINGS: "AYARLAR",
    CONTROLS: "KONTROLLER",
    CTRL_CLASSIC: "Klasik",
    CTRL_HOLD_FIRE: "Basılı Tut-Ateş",
    SENSITIVITY: "HASSASİYET",
    MUSIC: "MÜZİK",
    SFX: "SFX",
    LANGUAGE: "DİL",
    CLOSE: "KAPAT",
    START: "BAŞLAT",
    GO_TO_LOBBY: "LOBİYE GİT",
    HIGHSCORE: "EN YÜKSEK SKOR",
    MAX_KILLS: "MAKSİMUM LEŞ",
    WELCOME_BACK: "Tekrar Hoş Geldiniz",
    PLAYER: "OYUNCU",

    // HUD - Game
    HEALTH: "SAĞLIK",
    AMMO: "MÜHİMMAT",
    SCORE: "SKOR",
    KILLS: "LEŞ",
    WAVE: "DALGA",
    COMBO: "KOMBO",

    // Game Over Screen
    GAME_OVER: "OYUN BİTTİ",
    YOU_DIED: "ÖLDÜNÜZ!",
    YOU_SURVIVED: "HAYATTA KALDINIZ!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "TÜFEK LEŞLERİ",
    SNIPER_KILLS: "KESKİN NİŞANCI LEŞLERİ",

    // Rewarded Ad Popup
    RA_TITLE: "DEVAM ET?",
    RA_MESSAGE: "Canını yenilemek ve oynamaya devam etmek için bir reklam izle!",
    RA_WATCH_AD: "REKLAM İZLE",
    RA_NO_THANKS: "HAYIR, TEŞEKKÜRLER",
    RA_HP_TEXT: "+100 HP",

    // Collectable Types
    MED_KIT: "SAĞLIK ÇANTASI",
    RIFLE_AMMO: "TÜFEK MÜHİMMATI",
    SNIPER_AMMO: "KESKİN NİŞANCI MÜHİMMATI",
    GRENADE: "EL BOMBASI",
    FULL_HP: "(SAĞLIK DOLU)",
    FULL_AMMO: "(DOLU)",
    HP_SHORT: "HP",

    // Kill Types
    HEADSHOT: "KAFADAN VURUŞ",
    BODYSHOT: "GÖVDEDEN VURUŞ",
    KILLSTREAK: "LEŞ SERİSİ",

    // Tips & Messages
    TIP: "İPUCU",
    KEEP_MOVING: "HAYATTA KALMAK İÇİN HAREKET ETMEYE DEVAM EDİN VE SİPER ALIN!",
    AIM_FOR_HEAD: "EKSTRA HASAR İÇİN KAFAYA NİŞAN ALIN!",
    RELOAD_EARLY: "İHTİYACINIZ OLMADAN ÖNCE DOLDURUN — SAVAŞ SIRASINDA DEĞİL!",
    USE_COVER: "DİKİZLEMEK VE ATEŞ ETMEK İÇİN SİPER KULLANIN — GİZLİ KALIN!",
    COMBO_BONUS: "DAHA YÜKSEK KOMBO = DAHA BÜYÜK SKOR BONUSU!",
    ELIMINATE_ENEMIES:
      "BİR SONRAKİ DALGAYA GEÇMEK İÇİN TÜM DÜŞMANLARI ORTADAN KALDIRIN!",
    GET_READY: "HAZIRLANIN!",
    SURVIVE_STREETS: "SOKAKLARDA OLABİLDİĞİNCE UZUN SÜRE HAYATTA KALIN!",
    LOADING: "YÜKLENİYOR...",
    LOADING_ASSETS: "Varlıklar yükleniyor...",

    // In-game Feedback
    AMMO_OUT: "MÜHİMMAT BİTTİ!",
    WAVE_CLEAR: "DALGA TEMİZLENDİ!",
    WAVE_COMPLETE: "DALGA TAMAMLANDI",

    // Player Name
    ENTER_NAME: "ADINIZI GİRİN",
    TYPE_NAME: "İsim yazın",
    SAVE: "KAYDET",
    EDIT_NAME: "Oyuncu adını düzenle",

    // Lobby labels
    WELCOME_BACK: "Tekrar Hoş Geldiniz",

    // Game Over
    GO_TO_LOBBY: "LOBİYE GİT",
    SCORE: "SKOR",

    // Kill feedback
    HEADSHOT: "KAFADAN VURUŞ!",
    BODYSHOT: "GÖVDEDEN VURUŞ",
    KILLSTREAK: "LEŞ SERİSİ",

    // Tutorial
    TUT_CAMERA_TITLE: "Kamera Nişanı",
    TUT_CAMERA_DESC:
      "Yakındaki düşmanları görmek için ekranı sürükleyin",
    TUT_CAMERA_TITLE2: "Kamera Nişanı",
    TUT_CAMERA_DESC2:
      "Kameranızı düşmanlara doğrultmak için farenizi hareket ettirin",
    TUT_ADS_TITLE: "Dürbün Nişanı",
    TUT_ADS_DESC:
      "Dürbün açmak ve hassas nişan almak için soldaki DÜRBÜN düğmesine dokunun",
    TUT_ADS_TITLE2: "Hassas Nişan",
    TUT_ADS_DESC2:
      "Dürbün açmak ve hassas nişan almak için SAĞ tık düğmesini basılı tutun.",
    TUT_ADS_FIRE_TITLE: "Ateş!",
    TUT_ADS_FIRE_DESC: "Kamerayı ayarlayın ve ateş etmek için ateş et düğmesine dokunun",
    TUT_ADS_FIRE_TITLE2: "Ateş!",
    TUT_ADS_FIRE_DESC2: "Ateş etmek için SOL tuşa tıklayın!",
    TUT_JOYSTICK_AIM_TITLE: "Nişan Almak İçin Basılı Tut",
    TUT_JOYSTICK_AIM_DESC: "Yakınlaştırmak ve isabetli nişan almak için ateş düğmesini basılı tut!",
    TUT_JOYSTICK_FIRE_TITLE: "Ateş Etmek İçin Bırak!",
    TUT_JOYSTICK_FIRE_DESC: "Düşmanı vurmak için ateş düğmesini bırak!",
    TUT_GUN_SWITCH_TITLE: "Silah Değiştir",
    TUT_GUN_SWITCH_DESC:
      "Silahları değiştirmek için silah değiştirme düğmesine dokunun",
    TUT_GUN_SWITCH_TITLE2: "Silah Değiştir",
    TUT_GUN_SWITCH_DESC2: "Silah değiştirmek için TAB veya 1 ya da 2 sayılarına basın veya fare tekerleğinizi kaydırın",
    TUT_ELIMINATE_ALL_TITLE: "Hepsini Yok Et",
    TUT_ELIMINATE_ALL_DESC:
      "Düşmanlar size yalnızca dürbün açıkken veya atışınızı kaçırdığınızda vurabilir",
    TUT_ELIMINATE_ALL_TITLE2: "Hepsini Yok Et",
    TUT_ELIMINATE_ALL_DESC2:
      "Düşmanlar size yalnızca dürbün açıkken veya atışınızı kaçırdığınızda vurabilir",
    TUT_GRENADE_COLLECTED_TITLE: "El Bombası Toplandı!",
    TUT_GRENADE_COLLECTED_DESC:
      "Bir EL BOMBASI topladınız! Bu Sağlık Çantası veya Mühimmat da olabilir. Devam etmek için dokunun",
    TUT_GRENADE_COLLECTED_TITLE2: "El Bombası Toplandı!",
    TUT_GRENADE_COLLECTED_DESC2:
      "Bir EL BOMBASI topladınız! Bu Sağlık Çantası veya Mühimmat da olabilir. Devam etmek için tıklayın",
    TUT_GRENADE_EQUIP_TITLE: "El Bombasını Kuşan",
    TUT_GRENADE_EQUIP_DESC:
      "Elinize kuşanmak için EL BOMBASI simgesine dokunun",
    TUT_GRENADE_EQUIP_TITLE2: "El Bombasını Kuşan",
    TUT_GRENADE_EQUIP_DESC2: "Elinize kuşanmak için G tuşuna basın veya fare tekerleğini kaydırın",
    TUT_GRENADE_AIM_TITLE: "El Bombasını Nişan Al",
    TUT_GRENADE_AIM_DESC: "El bombası fırlatma çizgisini nişan almak için ekranın SAĞ tarafını basılı tutun!",
    TUT_GRENADE_AIM_TITLE2: "El Bombasını Nişan Al",
    TUT_GRENADE_AIM_DESC2: "El bombası fırlatma çizgisini nişan almak için SAĞ tık düğmesini basılı tutun!",
    TUT_GRENADE_THROW_TITLE: "El Bombasını At",
    TUT_GRENADE_THROW_DESC: "El bombasını atmak için bırakın!",
    TUT_GRENADE_THROW_TITLE2: "El Bombasını At",
    TUT_GRENADE_THROW_DESC2: "El bombasını atmak için SOL fare tuşuna tıklayın!",
    TUT_GRENADE_ELIMINATE_TITLE: "Hepsini Yok Et",
    TUT_GRENADE_ELIMINATE_DESC: "Kalan tüm düşmanları yok edin!",
    TUT_GRENADE_ELIMINATE_TITLE2: "Hepsini Yok Et",
    TUT_GRENADE_ELIMINATE_DESC2: "Kalan tüm düşmanları yok edin!",
    TUT_SCORE_TITLE: "Skor & Skorlar",
    TUT_SCORE_DESC:
      "İşte bu kadar! SKORUNUZU ve ÖLDÜRMELERİNİZİ buradan takip edebilirsiniz! Oynamaya devam etmek için herhangi bir yere dokunun",
    TUT_SCORE_TITLE2: "Skor & Skorlar",
    TUT_SCORE_DESC2:
      "İşte bu kadar! SKORUNUZU ve ÖLDÜRMELERİNİZİ buradan takip edebilirsiniz! Klik yapın",

    // Store
    STORE_TITLE: "MAĞAZA",
    STORE_GUNS: "SİLAHLAR",
    STORE_POWERUPS: "GÜÇLENDİRMELER",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "POMPALI TÜFEK",
    STORE_ROCKET_LAUNCHER: "ROKETATAR",
    STORE_GRENADE: "BOMBA",
    STORE_AMMO_PACK: "CEPHANE PAKETİ",
    STORE_BUY: "SATIN AL",
    STORE_OWNED: "SAHİP OLUNAN",
    STORE_MAX_LIMIT: "MAKSİMUM LİMİT",
    STORE_CLOSE: "KAPAT",
    STORE_NOT_ENOUGH_CASH: "YETERSİZ PARA!",
    STORE_PURCHASE_AGAIN: "Gelecek turda tekrar satın alabilirsiniz!",
    SELECT_WEAPONS_TITLE: "SİLAH SEÇ",
    SELECT_CONTINUE: "DEVAM ET",

    // Weapon Names
    RIFLE: "TÜFEK",
    SNIPER: "KESKİN NİŞANCI",

    // Additional UI
    ON: "AÇIK",
    OFF: "KAPALI",
    TIP_LABEL: "İPUCU:",
    NEXT_WAVE: "SONRAKİ DALGA",
    PLAYER_NAME_TITLE: "OYUNCU ADI",
  },

  vi: {
    // Lobby & Settings
    SETTINGS: "CÀI ĐẶT",
    CONTROLS: "ĐIỀU KHIỂN",
    CTRL_CLASSIC: "Cổ điển",
    CTRL_HOLD_FIRE: "Giữ-Bắn",
    SENSITIVITY: "ĐỘ NHẠY",
    MUSIC: "NHẠC",
    SFX: "HIỆU ỨNG",
    LANGUAGE: "NGÔN NGỮ",
    CLOSE: "ĐÓNG",
    START: "BẮT ĐẦU",
    GO_TO_LOBBY: "VỀ PHÒNG CHỜ",
    HIGHSCORE: "ĐIỂM CAO",
    MAX_KILLS: "KILLS TỐI ĐA",
    WELCOME_BACK: "Chào mừng trở lại",
    PLAYER: "NGƯỜI CHƠI",

    // HUD - Game
    HEALTH: "MÁU",
    AMMO: "ĐẠN",
    SCORE: "ĐIỂM",
    KILLS: "KILLS",
    WAVE: "ĐỢT",
    COMBO: "COMBO",

    // Game Over Screen
    GAME_OVER: "TRÒ CHƠI KẾT THÚC",
    YOU_DIED: "BẠN ĐÃ CHẾT!",
    YOU_SURVIVED: "BẠN ĐÃ SỐNG SÓT!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "KILLS BẰNG SÚNG TRƯỜNG",
    SNIPER_KILLS: "KILLS BẰNG SÚNG BẮN TỈA",

    // Rewarded Ad Popup
    RA_TITLE: "TIẾP TỤC?",
    RA_MESSAGE: "Xem quảng cáo để hồi máu và tiếp tục chơi!",
    RA_WATCH_AD: "XEM QUẢNG CÁO",
    RA_NO_THANKS: "KHÔNG, CẢM ƠN",
    RA_HP_TEXT: "+100 HP",

    // Collectable Types
    MED_KIT: "HỘP SƠ CỨU",
    RIFLE_AMMO: "ĐẠN SÚNG TRƯỜNG",
    SNIPER_AMMO: "ĐẠN SÚNG BẮN TỈA",
    GRENADE: "LỰU ĐẠN",
    FULL_HP: "(MÁU ĐẦY)",
    FULL_AMMO: "(ĐẦY)",
    HP_SHORT: "HP",

    // Kill Types
    HEADSHOT: "HEADSHOT",
    BODYSHOT: "BODYSHOT",
    KILLSTREAK: "CHUỖI DIỆT",

    // Tips & Messages
    TIP: "MẸO",
    KEEP_MOVING: "LIÊN TỤC DI CHUYỂN VÀ DÙNG VẬT CẢN ĐỂ SỐNG SÓT!",
    AIM_FOR_HEAD: "NHẮM VÀO ĐẦU ĐỂ TĂNG SÁT THƯƠNG!",
    RELOAD_EARLY: "NẠP ĐẠN TRƯỚC KHI CẦN — ĐỪNG NẠP TRONG KHI GIAO TRANH!",
    USE_COVER: "NẤP VÀO VẬT CẢN ĐỂ QUAN SÁT VÀ BẮN — HÃY LUÔN ẨN NẤP!",
    COMBO_BONUS: "COMBO CÀNG CAO = THƯỞNG ĐIỂM CÀNG LỚN!",
    ELIMINATE_ENEMIES: "TIÊU DIỆT TẤT CẢ KẺ THÙ ĐỂ QUA ĐỢT TIẾP THEO!",
    GET_READY: "CHUẨN BỊ!",
    SURVIVE_STREETS: "SỐNG SÓT TRÊN ĐƯỜNG PHỐ CÀNG LÂU CÀNG TỐT!",
    LOADING: "ĐANG TẢI...",
    LOADING_ASSETS: "Đang tải dữ liệu...",

    // In-game Feedback
    AMMO_OUT: "HẾT ĐẠN!",
    WAVE_CLEAR: "ĐÃ DỌN SẠCH ĐỢT!",
    WAVE_COMPLETE: "ĐỢT HOÀN THÀNH",

    // Player Name
    ENTER_NAME: "NHẬP TÊN CỦA BẠN",
    TYPE_NAME: "Nhập tên",
    SAVE: "LƯU",
    EDIT_NAME: "Sửa tên người chơi",

    // Lobby labels
    WELCOME_BACK: "Chào mừng trở lại",

    // Game Over
    GO_TO_LOBBY: "VỀ PHÒNG CHỜ",
    SCORE: "ĐIỂM",

    // Kill feedback
    HEADSHOT: "HEADSHOT!",
    BODYSHOT: "BODYSHOT",
    KILLSTREAK: "CHUỖI DIỆT",

    // Tutorial
    TUT_CAMERA_TITLE: "Nhắm Camera",
    TUT_CAMERA_DESC:
      "Kéo màn hình để nhìn thấy kẻ thù ở gần",
    TUT_CAMERA_TITLE2: "Nhắm Camera",
    TUT_CAMERA_DESC2: "Di chuyển chuột để hướng camera vào kẻ thù",
    TUT_ADS_TITLE: "Nhắm Ống Ngắm",
    TUT_ADS_DESC:
      "Chạm vào nút ỐNG NGẮM bên trái để ngắm qua ống ngắm và nhắm thật chính xác",
    TUT_ADS_TITLE2: "Nhắm Chính Xác",
    TUT_ADS_DESC2:
      "Nhấn và giữ nút chuột PHẢI để ngắm qua ống ngắm và nhắm thật chính xác.",
    TUT_ADS_FIRE_TITLE: "Bắn!",
    TUT_ADS_FIRE_DESC: "Điều chỉnh camera và chạm vào nút bắn để bắn",
    TUT_ADS_FIRE_TITLE2: "Bắn!",
    TUT_ADS_FIRE_DESC2: "Nhấp chuột TRÁI để bắn!",
    TUT_JOYSTICK_AIM_TITLE: "Giữ để Nhắm",
    TUT_JOYSTICK_AIM_DESC: "Giữ nút bắn để mở ống ngắm và nhắm chính xác!",
    TUT_JOYSTICK_FIRE_TITLE: "Thả ra để Bắn!",
    TUT_JOYSTICK_FIRE_DESC: "Thả nút bắn để bắn kẻ thù!",
    TUT_GUN_SWITCH_TITLE: "Đổi Vũ Khí",
    TUT_GUN_SWITCH_DESC: "Chạm vào nút chuyển đổi vũ khí để đổi vũ khí khác",
    TUT_GUN_SWITCH_TITLE2: "Đổi Vũ Khí",
    TUT_GUN_SWITCH_DESC2: "Nhấn TAB hoặc phím số 1 hoặc 2, hoặc cuộn bánh xe chuột của bạn để đổi vũ khí",
    TUT_ELIMINATE_ALL_TITLE: "Tiêu Diệt Tất Cả",
    TUT_ELIMINATE_ALL_DESC:
      "Kẻ thù chỉ bắn trúng bạn khi bạn đang ngắm qua ống ngắm hoặc bắn trượt",
    TUT_ELIMINATE_ALL_TITLE2: "Tiêu Diệt Tất Cả",
    TUT_ELIMINATE_ALL_DESC2:
      "Kẻ thù chỉ bắn trúng bạn khi bạn đang ngắm qua ống ngắm hoặc bắn trượt",
    TUT_GRENADE_COLLECTED_TITLE: "Đã Nhặt Lựu Đạn!",
    TUT_GRENADE_COLLECTED_DESC:
      "Bạn đã nhặt được LỰU ĐẠN! Nó cũng có thể là Hộp cứu thương hoặc Đạn. Chạm để tiếp tục",
    TUT_GRENADE_COLLECTED_TITLE2: "Đã Nhặt Lựu Đạn!",
    TUT_GRENADE_COLLECTED_DESC2:
      "Bạn đã nhặt được LỰU ĐẠN! Nó cũng có thể là Hộp cứu thương hoặc Đạn. Nhấp chuột để tiếp tục",
    TUT_GRENADE_EQUIP_TITLE: "Trang Bị Lựu Đạn",
    TUT_GRENADE_EQUIP_DESC: "Chạm vào biểu tượng LỰU ĐẠN để cầm trên tay",
    TUT_GRENADE_EQUIP_TITLE2: "Trang Bị Lựu Đạn",
    TUT_GRENADE_EQUIP_DESC2: "Nhấn phím G hoặc cuộn bánh xe chuột để trang bị lựu đạn trên tay",
    TUT_GRENADE_AIM_TITLE: "Nhắm Lựu Đạn",
    TUT_GRENADE_AIM_DESC: "Giữ bên PHẢI màn hình để nhắm quỹ đạo của lựu đạn!",
    TUT_GRENADE_AIM_TITLE2: "Nhắm Lựu Đạn",
    TUT_GRENADE_AIM_DESC2: "Nhấn và giữ nút chuột PHẢI để nhắm quỹ đạo của lựu đạn!",
    TUT_GRENADE_THROW_TITLE: "Ném Lựu Đạn",
    TUT_GRENADE_THROW_DESC: "Thả ra để ném lựu đạn!",
    TUT_GRENADE_THROW_TITLE2: "Ném Lựu Đạn",
    TUT_GRENADE_THROW_DESC2: "Nhấp chuột TRÁI để ném lựu đạn!",
    TUT_GRENADE_ELIMINATE_TITLE: "Tiêu Diệt Tất Cả",
    TUT_GRENADE_ELIMINATE_DESC: "Tiêu diệt tất cả kẻ thù còn lại!",
    TUT_GRENADE_ELIMINATE_TITLE2: "Tiêu Diệt Tất Cả",
    TUT_GRENADE_ELIMINATE_DESC2: "Tiêu diệt tất cả kẻ thù còn lại!",
    TUT_SCORE_TITLE: "Điểm & Số Mạng",
    TUT_SCORE_DESC:
      "Thế là xong! Bạn có thể theo dõi ĐIỂM và SỐ MẠNG hạ gục ở đây! Chạm vào bất kỳ đâu để tiếp tục chơi",
    TUT_SCORE_TITLE2: "Điểm & Số Mạng",
    TUT_SCORE_DESC2:
      "Thế là xong! Bạn có thể theo dõi ĐIỂM và SỐ MẠNG hạ gục ở đây! Nhấp chuột vào bất kỳ đâu để tiếp tục chơi",

    // Store
    STORE_TITLE: "CỬA HÀNG",
    STORE_GUNS: "SÚNG",
    STORE_POWERUPS: "VẬT PHẨM HỖ TRỢ",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "SÚNG SĂN",
    STORE_ROCKET_LAUNCHER: "SÚNG TÊN LỬA",
    STORE_GRENADE: "LỰU ĐẠN",
    STORE_AMMO_PACK: "GÓI ĐẠN",
    STORE_BUY: "MUA",
    STORE_OWNED: "ĐÃ SỞ HỮU",
    STORE_MAX_LIMIT: "GIỚI HẠN TỐI ĐA",
    STORE_CLOSE: "ĐÓNG",
    STORE_NOT_ENOUGH_CASH: "KHÔNG ĐỦ TIỀN!",
    STORE_PURCHASE_AGAIN: "Bạn có thể mua lại ở vòng tiếp theo!",
    SELECT_WEAPONS_TITLE: "CHỌN VŨ KHÍ",
    SELECT_CONTINUE: "TIẾP TỤC",

    // Weapon Names
    RIFLE: "SÚNG TRƯỜNG",
    SNIPER: "SÚNG BẮN TỈA",

    // Additional UI
    ON: "BẬT",
    OFF: "TẮT",
    TIP_LABEL: "MẸO:",
    NEXT_WAVE: "ĐỢT TIẾP THEO",
    PLAYER_NAME_TITLE: "TÊN NGƯỜI CHƠI",
  },

  ko: {
    // Lobby & Settings
    SETTINGS: "설정",
    CONTROLS: "조작법",
    CTRL_CLASSIC: "클래식",
    CTRL_HOLD_FIRE: "길게누르고사격",
    SENSITIVITY: "감도",
    MUSIC: "음악",
    SFX: "음향 효과",
    LANGUAGE: "언어",
    CLOSE: "닫기",
    START: "시작",
    GO_TO_LOBBY: "로비로 이동",
    HIGHSCORE: "최고 점수",
    MAX_KILLS: "최대 킬수",
    WELCOME_BACK: "다시 오신 것을 환영합니다",
    PLAYER: "플레이어",

    // HUD - Game
    HEALTH: "체력",
    AMMO: "탄약",
    SCORE: "점수",
    KILLS: "킬",
    WAVE: "웨이브",
    COMBO: "콤보",

    // Game Over Screen
    GAME_OVER: "게임 오버",
    YOU_DIED: "사망했습니다!",
    YOU_SURVIVED: "생존했습니다!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "소총 킬수",
    SNIPER_KILLS: "저격총 킬수",

    // Rewarded Ad Popup
    RA_TITLE: "계속하시겠습니까?",
    RA_MESSAGE: "광고를 시청하고 체력을 회복하여 계속 플레이하세요!",
    RA_WATCH_AD: "광고 보기",
    RA_NO_THANKS: "아니요, 괜찮습니다",
    RA_HP_TEXT: "+100 HP",

    // Collectable Types
    MED_KIT: "구급 상자",
    RIFLE_AMMO: "소총 탄약",
    SNIPER_AMMO: "저격총 탄약",
    GRENADE: "수류탄",
    FULL_HP: "(체력 꽉 참)",
    FULL_AMMO: "(가득 참)",
    HP_SHORT: "HP",

    // Kill Types
    HEADSHOT: "헤드샷",
    BODYSHOT: "바디샷",
    KILLSTREAK: "킬스트레이크",

    // Tips & Messages
    TIP: "팁",
    KEEP_MOVING: "살아남으려면 계속 움직이고 엄폐물을 사용하세요!",
    AIM_FOR_HEAD: "보너스 피해를 주려면 머리를 조준하세요!",
    RELOAD_EARLY: "전투 중이 아닐 때, 미리 재장전하세요!",
    USE_COVER: "엄폐물을 사용해 엿보고 쏘세요 — 숨어 계세요!",
    COMBO_BONUS: "콤보가 높을수록 점수 보너스도 커집니다!",
    ELIMINATE_ENEMIES: "다음 웨이브로 넘어가려면 모든 적을 처치하세요!",
    GET_READY: "준비하세요!",
    SURVIVE_STREETS: "거리에서 가능한 한 오래 살아남으세요!",
    LOADING: "로딩 중...",
    LOADING_ASSETS: "에셋 로딩 중...",

    // In-game Feedback
    AMMO_OUT: "탄약 부족!",
    WAVE_CLEAR: "웨이브 클리어!",
    WAVE_COMPLETE: "웨이브 완료",

    // Player Name
    ENTER_NAME: "이름을 입력하세요",
    TYPE_NAME: "이름 입력",
    SAVE: "저장",
    EDIT_NAME: "플레이어 이름 수정",

    // Lobby labels
    WELCOME_BACK: "다시 오신 것을 환영합니다",

    // Game Over
    GO_TO_LOBBY: "로비로 이동",
    SCORE: "점수",

    // Kill feedback
    HEADSHOT: "헤드샷!",
    BODYSHOT: "바디샷",
    KILLSTREAK: "킬스트레이크",

    // Tutorial
    TUT_CAMERA_TITLE: "카메라 조준",
    TUT_CAMERA_DESC:
      "화면을 드래그하여 근처의 적들을 확인하세요",
    TUT_CAMERA_TITLE2: "카메라 조준",
    TUT_CAMERA_DESC2: "마우스를 움직여 적에게 카메라를 조준하세요",
    TUT_ADS_TITLE: "조준경 조준",
    TUT_ADS_DESC:
      "조준경을 켜고 정밀하게 조준하려면 왼쪽의 조준경(SCOPE) 버튼을 탭하세요",
    TUT_ADS_TITLE2: "정밀 조준",
    TUT_ADS_DESC2: "우클릭 버튼을 길게 눌러 조준경을 켜고 정밀하게 조준하세요.",
    TUT_ADS_FIRE_TITLE: "발사!",
    TUT_ADS_FIRE_DESC: "카메라를 조정한 후 발사 버튼을 탭하여 사격하세요",
    TUT_ADS_FIRE_TITLE2: "발사!",
    TUT_ADS_FIRE_DESC2: "마우스 왼쪽 버튼을 클릭하여 발사하세요!",
    TUT_JOYSTICK_AIM_TITLE: "길게 눌러 조준",
    TUT_JOYSTICK_AIM_DESC: "발사 버튼을 길게 눌러 스코프를 열고 정확히 조준하세요!",
    TUT_JOYSTICK_FIRE_TITLE: "놓아서 발사!",
    TUT_JOYSTICK_FIRE_DESC: "발사 버튼을 놓아 적을 쏘세요!",
    TUT_GUN_SWITCH_TITLE: "무기 교체",
    TUT_GUN_SWITCH_DESC: "무기 교체 버튼을 탭하여 무기를 변경하세요",
    TUT_GUN_SWITCH_TITLE2: "무기 교체",
    TUT_GUN_SWITCH_DESC2: "TAB 또는 숫자 키 1 또는 2를 누르거나 마우스 휠을 스크롤하여 무기를 교체하세요",
    TUT_ELIMINATE_ALL_TITLE: "적 처치",
    TUT_ELIMINATE_ALL_DESC:
      "적은 조준경을 켜고 있거나 사격을 빗맞췄을 때만 당신을 맞춥니다",
    TUT_ELIMINATE_ALL_TITLE2: "적 처치",
    TUT_ELIMINATE_ALL_DESC2:
      "적은 조준경을 켜고 있거나 사격을 빗맞췄을 때만 당신을 맞춥니다",
    TUT_GRENADE_COLLECTED_TITLE: "수류탄 획득!",
    TUT_GRENADE_COLLECTED_DESC:
      "수류탄을 획득했습니다! 구급상자나 탄약일 수도 있습니다. 화면을 탭하여 계속하세요",
    TUT_GRENADE_COLLECTED_TITLE2: "수류탄 획득!",
    TUT_GRENADE_COLLECTED_DESC2:
      "수류탄을 획득했습니다! 구급상자나 탄약일 수도 있습니다. 마우스를 클릭하여 계속하세요",
    TUT_GRENADE_EQUIP_TITLE: "수류탄 장착",
    TUT_GRENADE_EQUIP_DESC: "수류탄 아이콘을 탭하여 손에 들으세요",
    TUT_GRENADE_EQUIP_TITLE2: "수류탄 장착",
    TUT_GRENADE_EQUIP_DESC2: "G 키를 누르거나 마우스 휠을 스크롤하여 손에 수류탄을 들으세요",
    TUT_GRENADE_AIM_TITLE: "수류탄 조준",
    TUT_GRENADE_AIM_DESC: "수류탄의 궤적을 조준하려면 화면 오른쪽을 길게 누르세요!",
    TUT_GRENADE_AIM_TITLE2: "수류탄 조준",
    TUT_GRENADE_AIM_DESC2: "수류탄의 궤적을 조준하려면 우클릭 버튼을 길게 누르세요!",
    TUT_GRENADE_THROW_TITLE: "수류탄 던지기",
    TUT_GRENADE_THROW_DESC: "손을 떼면 수류탄이 던져집니다!",
    TUT_GRENADE_THROW_TITLE2: "수류탄 던지기",
    TUT_GRENADE_THROW_DESC2: "마우스 왼쪽 버튼을 클릭하여 수류탄을 던지세요!",
    TUT_GRENADE_ELIMINATE_TITLE: "적 처치",
    TUT_GRENADE_ELIMINATE_DESC: "남은 적을 모두 처치하세요!",
    TUT_GRENADE_ELIMINATE_TITLE2: "적 처치",
    TUT_GRENADE_ELIMINATE_DESC2: "남은 적을 모두 처치하세요!",
    TUT_SCORE_TITLE: "점수 및 킬수",
    TUT_SCORE_DESC:
      "완료되었습니다! 여기서 점수와 처치 수를 확인할 수 있습니다! 아무 데나 탭하여 게임을 계속하세요",
    TUT_SCORE_TITLE2: "점수 및 킬수",
    TUT_SCORE_DESC2:
      "완료되었습니다! 여기서 점수와 처치 수를 확인할 수 있습니다! 아무 데나 클릭하여 게임을 계속하세요",

    // Store
    STORE_TITLE: "상점",
    STORE_GUNS: "무기",
    STORE_POWERUPS: "파워업",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "샷건",
    STORE_ROCKET_LAUNCHER: "로켓 라운처",
    STORE_GRENADE: "수류탄",
    STORE_AMMO_PACK: "탄약 팩",
    STORE_BUY: "구매",
    STORE_OWNED: "보유 중",
    STORE_MAX_LIMIT: "최대 제한",
    STORE_CLOSE: "닫기",
    STORE_NOT_ENOUGH_CASH: "골드가 부족합니다!",
    STORE_PURCHASE_AGAIN: "다음 라운드에서 다시 구매할 수 있습니다!",
    SELECT_WEAPONS_TITLE: "무기 선택",
    SELECT_CONTINUE: "계속하기",

    // Weapon Names
    RIFLE: "소총",
    SNIPER: "저격총",

    // Additional UI
    ON: "켜짐",
    OFF: "꺼짐",
    TIP_LABEL: "팁:",
    NEXT_WAVE: "다음 웨이브",
    PLAYER_NAME_TITLE: "플레이어 이름",
  },

  uk: {
    // Lobby & Settings
    SETTINGS: "НАЛАШТУВАННЯ",
    CONTROLS: "КЕРУВАННЯ",
    CTRL_CLASSIC: "Класичне",
    CTRL_HOLD_FIRE: "Утримання вогню",
    SENSITIVITY: "ЧУТЛИВІСТЬ",
    MUSIC: "МУЗИКА",
    SFX: "ЗВУКИ",
    LANGUAGE: "МОВА",
    CLOSE: "ЗАКРИТИ",
    START: "ПОЧАТИ",
    GO_TO_LOBBY: "У ЛОБІ",
    HIGHSCORE: "РЕКОРД",
    MAX_KILLS: "МАКС. УБИВСТВ",
    WELCOME_BACK: "З поверненням",
    PLAYER: "ГРАВЕЦЬ",

    // HUD - Game
    HEALTH: "ЗДОРОВ'Я",
    AMMO: "НАБОЇ",
    SCORE: "РАХУНОК",
    KILLS: "УБИТО",
    WAVE: "ХВИЛЯ",
    COMBO: "КОМБО",

    // Game Over Screen
    GAME_OVER: "ГРА ЗАКІНЧЕНА",
    YOU_DIED: "ВИ ЗАГИНУЛИ!",
    YOU_SURVIVED: "ВИ ВИЖИЛИ!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "УБИТО З ГВИНТІВКИ",
    SNIPER_KILLS: "СНАЙПЕРСЬКІ УБИТО",

    // Rewarded Ad Popup
    RA_TITLE: "ПРОДОВЖИТИ?",
    RA_MESSAGE: "Подивіться рекламу, щоб відновити здоров'я та продовжити гру!",
    RA_WATCH_AD: "ДИВИТИСЬ РЕКЛАМУ",
    RA_NO_THANKS: "НІ, ДЯКУЮ",
    RA_HP_TEXT: "+100 HP",

    // Collectable Types
    MED_KIT: "АПТЕЧКА",
    RIFLE_AMMO: "НАБОЇ ДЛЯ ГВИНТІВКИ",
    SNIPER_AMMO: "СНАЙПЕРСЬКІ НАБОЇ",
    GRENADE: "ГРАНАТА",
    FULL_HP: "(ПОВНЕ ЗДОРОВ'Я)",
    FULL_AMMO: "(ПОВНИЙ)",
    HP_SHORT: "ОЗ",

    // Kill Types
    HEADSHOT: "ХЕДШОТ",
    BODYSHOT: "У ТІЛО",
    KILLSTREAK: "СЕРИЯ УБИВСТВ",

    // Tips & Messages
    TIP: "ПОРАДА",
    KEEP_MOVING: "ПОСТІЙНО РУХАЙТЕСЯ ТА ВИКОРИСТОВУЙТЕ УКРИТТЯ, ЩОБ ВИЖИТИ!",
    AIM_FOR_HEAD: "ЦІЛЬТЕСЯ В ГОЛОВУ ДЛЯ ДОДАТКОВОЇ ШКОДИ!",
    RELOAD_EARLY: "ПЕРЕЗАРАДЖАЙТЕСЯ ЗАЗДАЛЕГІДЬ — НЕ ПІД ЧАС БОЮ!",
    USE_COVER: "ВИКОРИСТОВУЙТЕ УКРИТТЯ, ЩОБ ВИЗИРАТИ ТА СТРІЛЯТИ — ХОВАЙТЕСЯ!",
    COMBO_BONUS: "БІЛЬШЕ КОМБО = БІЛЬШИЙ БОНУС ОЧОК!",
    ELIMINATE_ENEMIES: "ЗНИЩЬТЕ ВСІХ ВОРОГІВ, ЩОБ ПЕРЕЙТИ ДО НАСТУПНОЇ ХВИЛІ!",
    GET_READY: "ПРИГОТУЙТЕСЯ!",
    SURVIVE_STREETS: "ВИЖИВАЙТЕ НА ВУЛИЦЯХ ЯКНАЙДОВШЕ!",
    LOADING: "ЗАВАНТАЖЕННЯ...",
    LOADING_ASSETS: "Завантаження ресурсів…",

    // In-game Feedback
    AMMO_OUT: "СКІНЧИЛИСЯ НАБОЇ!",
    WAVE_CLEAR: "ХВИЛЮ ЗАЧИЩЕНО!",
    WAVE_COMPLETE: "ХВИЛЮ ПРОЙДЕНО",

    // Player Name
    ENTER_NAME: "ВВЕДІТЬ СВОЄ ІМ'Я",
    TYPE_NAME: "Введіть ім'я",
    SAVE: "ЗБЕРЕГТИ",
    EDIT_NAME: "Змінити ім'я гравця",

    // Lobby labels
    WELCOME_BACK: "З поверненням",

    // Game Over
    GO_TO_LOBBY: "У ЛОБІ",
    SCORE: "РАХУНОК",

    // Kill feedback
    HEADSHOT: "ХЕДШОТ!",
    BODYSHOT: "У ТІЛО",
    KILLSTREAK: "СЕРІЯ УБИВСТВ",

    // Tutorial
    TUT_CAMERA_TITLE: "Прицел камери",
    TUT_CAMERA_DESC:
      "Проведіть по екрану, щоб побачити ворогів поблизу",
    TUT_CAMERA_TITLE2: "Прицел камери",
    TUT_CAMERA_DESC2: "Рухайте мишу, щоб спрямувати камеру на ворогів",
    TUT_ADS_TITLE: "Прицілювання через приціл",
    TUT_ADS_DESC:
      "Натисніть кнопку прицілу ліворуч, щоб увійти в режим прицілювання та цілитися точніше",
    TUT_ADS_TITLE2: "Точне прицілювання",
    TUT_ADS_DESC2:
      "Натисніть і утримуйте ПРАВУ кнопку миші, щоб прицілитися через приціл і цілитися точніше.",
    TUT_ADS_FIRE_TITLE: "Вогонь!",
    TUT_ADS_FIRE_DESC: "Налаштуйте роботу камери та натисніть кнопку вогню, щоб вистрілити",
    TUT_ADS_FIRE_TITLE2: "Вогонь!",
    TUT_ADS_FIRE_DESC2: "Натисніть ЛІВУ кнопку миші, щоб вистрілити!",
    TUT_JOYSTICK_AIM_TITLE: "Утримуйте для прицілювання",
    TUT_JOYSTICK_AIM_DESC: "Утримуйте кнопку стрільби, щоб прицілитися!",
    TUT_JOYSTICK_FIRE_TITLE: "Відпустіть для стрільби!",
    TUT_JOYSTICK_FIRE_DESC: "Відпустіть кнопку стрільби, щоб вистрілити у ворога!",
    TUT_GUN_SWITCH_TITLE: "Змінити зброю",
    TUT_GUN_SWITCH_DESC: "Натисніть кнопку зміни зброї, щоб змінити її",
    TUT_GUN_SWITCH_TITLE2: "Змінити зброю",
    TUT_GUN_SWITCH_DESC2: "Натисніть TAB, цифри 1 чи 2 або прокрутіть коліщатко миші, щоб змінити зброю",
    TUT_ELIMINATE_ALL_TITLE: "Знищити всіх",
    TUT_ELIMINATE_ALL_DESC:
      "Вороги влучають у вас лише тоді, коли ви цілитеся через приціл або коли ви промахуєтеся",
    TUT_ELIMINATE_ALL_TITLE2: "Знищити всіх",
    TUT_ELIMINATE_ALL_DESC2:
      "Вороги влучають у вас лише тоді, коли ви цілитеся через приціл або коли ви промахуєтеся",
    TUT_GRENADE_COLLECTED_TITLE: "Граната отримана!",
    TUT_GRENADE_COLLECTED_DESC:
      "Ви підібрали ГРАНАТУ! Це також могла бути аптечка або патрони. Натисніть, щоб продовжити",
    TUT_GRENADE_COLLECTED_TITLE2: "Граната отримана!",
    TUT_GRENADE_COLLECTED_DESC2:
      "Ви підібрали ГРАНАТУ! Це також могла бути аптечка або патрони. Клацніть, щоб продовжити",
    TUT_GRENADE_EQUIP_TITLE: "Взяти гранату",
    TUT_GRENADE_EQUIP_DESC: "Натисніть на іконку ГРАНАТИ, щоб взяти її в руку",
    TUT_GRENADE_EQUIP_TITLE2: "Взяти гранату",
    TUT_GRENADE_EQUIP_DESC2: "Натисніть клавішу G або прокрутіть коліщатко миші, щоб взяти гранату в руку",
    TUT_GRENADE_AIM_TITLE: "Прицілювання гранати",
    TUT_GRENADE_AIM_DESC: "Утримуйте ПРАВУ частину екрана, щоб націлити траєкторію гранати!",
    TUT_GRENADE_AIM_TITLE2: "Прицілювання гранати",
    TUT_GRENADE_AIM_DESC2: "Натисніть і утримуйте ПРАВУ кнопку миші, щоб націлити траєкторію гранати!",
    TUT_GRENADE_THROW_TITLE: "Кинути гранату",
    TUT_GRENADE_THROW_DESC: "Відпустіть, щоб кинути гранату!",
    TUT_GRENADE_THROW_TITLE2: "Кинути гранату",
    TUT_GRENADE_THROW_DESC2: "Клацніть ЛІВОЮ кнопкою миші, щоб кинути гранату!",
    TUT_GRENADE_ELIMINATE_TITLE: "Знищити всіх",
    TUT_GRENADE_ELIMINATE_DESC: "Знищте всіх ворогів, що залишилися!",
    TUT_GRENADE_ELIMINATE_TITLE2: "Знищити всіх",
    TUT_GRENADE_ELIMINATE_DESC2: "Знищте всіх ворогів, що залишилися!",
    TUT_SCORE_TITLE: "Рахунок та вбивства",
    TUT_SCORE_DESC:
      "Ось і все! Ви можете відстежувати свій РАХУНОК та ВБИВСТВА тут! Натисніть у будь-якому місці, щоб продовжити гру",
    TUT_SCORE_TITLE2: "Рахунок та вбивства",
    TUT_SCORE_DESC2:
      "Ось і все! Ви можете відстежувати свій РАХУНОК та ВБИВСТВА тут! Клацніть у будь-якому місці, щоб продовжити гру",

    // Store
    STORE_TITLE: "МАГАЗИН",
    STORE_GUNS: "ЗБРОЯ",
    STORE_POWERUPS: "ПІДСИЛЕННЯ",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "ДРОБОВИК",
    STORE_ROCKET_LAUNCHER: "РАКЕТНИЦЯ",
    STORE_GRENADE: "ГРАНАТА",
    STORE_AMMO_PACK: "КОМПЛЕКТ НАБОЇВ",
    STORE_BUY: "КУПИТИ",
    STORE_OWNED: "КУПЛЕНО",
    STORE_MAX_LIMIT: "МАКС. ЛІМІТ",
    STORE_CLOSE: "ЗАКРИТИ",
    STORE_NOT_ENOUGH_CASH: "НЕДОСТАТНЬО КОШТІВ!",
    STORE_PURCHASE_AGAIN: "Ви зможете придбати це знову в наступному раунді!",
    SELECT_WEAPONS_TITLE: "ВИБІР ЗБРОЇ",
    SELECT_CONTINUE: "ПРОДОВЖИТИ",

    // Weapon Names
    RIFLE: "ГВИНТІВКА",
    SNIPER: "СНАЙПЕР",

    // Additional UI
    ON: "УВІМК",
    OFF: "ВИМК",
    TIP_LABEL: "ПОРАДА:",
    NEXT_WAVE: "НАСТУПНА ХВИЛЯ",
    PLAYER_NAME_TITLE: "ІМ'Я ГРАВЦЯ",
  },

  ms: {
    // Lobby & Settings
    SETTINGS: "TETAPAN",
    CONTROLS: "KAWALAN",
    CTRL_CLASSIC: "Klasik",
    CTRL_HOLD_FIRE: "Tahan-Tembak",
    SENSITIVITY: "SENSITIVITI",
    MUSIC: "MUZIK",
    SFX: "SFX",
    LANGUAGE: "BAHASA",
    CLOSE: "TUTUP",
    START: "MULA",
    GO_TO_LOBBY: "KE LOBI",
    HIGHSCORE: "SKOR TERTINGGI",
    MAX_KILLS: "KILL MAKSIMUM",
    WELCOME_BACK: "Selamat Kembali",
    PLAYER: "PEMAIN",

    // HUD - Game
    HEALTH: "DARAH",
    AMMO: "AMUNISI",
    SCORE: "SKOR",
    KILLS: "KILL",
    WAVE: "GELOMBANG",
    COMBO: "KOMBO",

    // Game Over Screen
    GAME_OVER: "PERMAINAN TAMAT",
    YOU_DIED: "ANDA MATI!",
    YOU_SURVIVED: "ANDA BERJAYA MANDIRI!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "KILL RIFLE",
    SNIPER_KILLS: "KILL SNIPER",

    // Rewarded Ad Popup
    RA_TITLE: "TERUSKAN?",
    RA_MESSAGE: "Tonton iklan untuk memulihkan kesihatan dan terus bermain!",
    RA_WATCH_AD: "TONTON IKLAN",
    RA_NO_THANKS: "TIDAK, TERIMA KASIH",
    RA_HP_TEXT: "+100 HP",

    // Collectable Types
    MED_KIT: "KIT PERUBATAN",
    RIFLE_AMMO: "AMUNISI RIFLE",
    SNIPER_AMMO: "AMUNISI SNIPER",
    GRENADE: "BOM TANGAN",
    FULL_HP: "(DARAH PENUH)",
    FULL_AMMO: "(PENUH)",
    HP_SHORT: "HP",

    // Kill Types
    HEADSHOT: "HEADSHOT",
    BODYSHOT: "BODYSHOT",
    KILLSTREAK: "KILLSTREAK",

    // Tips & Messages
    TIP: "TIP",
    KEEP_MOVING: "TERUS BERGERAK DAN GUNAKAN PERLINDUNGAN UNTUK KEKAL HIDUP!",
    AIM_FOR_HEAD: "SASAR KEPALA UNTUK BONUS KEROSAKAN!",
    RELOAD_EARLY: "MUAT SEMULA SEBELUM PERLU — BUKAN SEMASA BERTEMPUR!",
    USE_COVER:
      "GUNAKAN PERLINDUNGAN UNTUK MENGINTIP DAN MENEMBAK — KEKAL SEMBUNYI!",
    COMBO_BONUS: "KOMBO LEBIH TINGGI = BONUS SKOR LEBIH BESAR!",
    ELIMINATE_ENEMIES:
      "HAPUSKAN SEMUA MUSUH UNTUK MARA KE GELOMBANG SETERUSNYA!",
    GET_READY: "BERSEDIA!",
    SURVIVE_STREETS: "BERTAHAN DI JALANAN SELAMA MUNGKIN!",
    LOADING: "MEMUATKAN...",
    LOADING_ASSETS: "Memuatkan aset…",

    // In-game Feedback
    AMMO_OUT: "KEHABISAN AMUNISI!",
    WAVE_CLEAR: "GELOMBANG BERSIH!",
    WAVE_COMPLETE: "GELOMBANG SELESAI",

    // Player Name
    ENTER_NAME: "MASUKKAN NAMA ANDA",
    TYPE_NAME: "Taip nama",
    SAVE: "SIMPAN",
    EDIT_NAME: "Edit nama pemain",

    // Lobby labels
    WELCOME_BACK: "Selamat Kembali",

    // Game Over
    GO_TO_LOBBY: "KE LOBI",
    SCORE: "SKOR",

    // Kill feedback
    HEADSHOT: "HEADSHOT!",
    BODYSHOT: "BODYSHOT",
    KILLSTREAK: "KILLSTREAK",

    // Tutorial
    TUT_CAMERA_TITLE: "Haluan Kamera",
    TUT_CAMERA_DESC:
      "Seret skrin untuk melihat musuh yang berdekatan",
    TUT_CAMERA_TITLE2: "Haluan Kamera",
    TUT_CAMERA_DESC2:
      "Gerakkan tetikus anda untuk mengarahkan kamera ke arah musuh",
    TUT_ADS_TITLE: "Bidikan Skop",
    TUT_ADS_DESC:
      "Ketik butang SKOP di sebelah kiri untuk menggunakan skop dan membidik dengan tepat",
    TUT_ADS_TITLE2: "Bidikan Tepat",
    TUT_ADS_DESC2:
      "Tekan dan tahan butang klik KANAN untuk menggunakan skop dan membidik dengan tepat.",
    TUT_ADS_FIRE_TITLE: "Tembak!",
    TUT_ADS_FIRE_DESC: "Laraskan kamera dan ketik butang tembak untuk menembak",
    TUT_ADS_FIRE_TITLE2: "Tembak!",
    TUT_ADS_FIRE_DESC2: "Klik butang KIRI untuk menembak!",
    TUT_JOYSTICK_AIM_TITLE: "Tahan untuk Membidik",
    TUT_JOYSTICK_AIM_DESC: "Tahan butang tembak untuk menggunakan skop dan membidik dengan tepat!",
    TUT_JOYSTICK_FIRE_TITLE: "Lepaskan untuk Menembak!",
    TUT_JOYSTICK_FIRE_DESC: "Lepaskan butang tembak untuk menembak musuh!",
    TUT_GUN_SWITCH_TITLE: "Tukar Senjata",
    TUT_GUN_SWITCH_DESC: "Ketik butang tukar senjata untuk menukar senjata",
    TUT_GUN_SWITCH_TITLE2: "Tukar Senjata",
    TUT_GUN_SWITCH_DESC2: "Tekan TAB atau nombor 1 atau 2 atau skrol roda tetikus anda untuk menukar senjata",
    TUT_ELIMINATE_ALL_TITLE: "Hapuskan Semua",
    TUT_ELIMINATE_ALL_DESC:
      "Musuh hanya akan menembak anda semasa anda menggunakan skop atau apabila tembakan anda tersasar",
    TUT_ELIMINATE_ALL_TITLE2: "Hapuskan Semua",
    TUT_ELIMINATE_ALL_DESC2:
      "Musuh hanya akan menembak anda semasa anda menggunakan skop atau apabila tembakan anda tersasar",
    TUT_GRENADE_COLLECTED_TITLE: "Bom Tangan Dikutip!",
    TUT_GRENADE_COLLECTED_DESC:
      "Anda telah mengutip BOM TANGAN! Ia juga boleh jadi Kotak Perubatan atau Peluru. Ketik untuk teruskan",
    TUT_GRENADE_COLLECTED_TITLE2: "Bom Tangan Dikutip!",
    TUT_GRENADE_COLLECTED_DESC2:
      "Anda telah mengutip BOM TANGAN! Ia juga boleh jadi Kotak Perubatan atau Peluru. Klik untuk teruskan",
    TUT_GRENADE_EQUIP_TITLE: "Lengkapi Bom Tangan",
    TUT_GRENADE_EQUIP_DESC:
      "Ketik ikon BOM TANGAN untuk melengkapkannya di tangan anda",
    TUT_GRENADE_EQUIP_TITLE2: "Lengkapi Bom Tangan",
    TUT_GRENADE_EQUIP_DESC2: "Tekan butang G atau skrol roda tetikus untuk melengkapi bom tangan di tangan anda",
    TUT_GRENADE_AIM_TITLE: "Acukan Bom Tangan",
    TUT_GRENADE_AIM_DESC: "Tahan bahagian KANAN skrin untuk mengacukan trajektori bom tangan!",
    TUT_GRENADE_AIM_TITLE2: "Acukan Bom Tangan",
    TUT_GRENADE_AIM_DESC2: "Tekan dan tahan butang klik KANAN untuk mengacukan trajektori bom tangan!",
    TUT_GRENADE_THROW_TITLE: "Baling Bom Tangan",
    TUT_GRENADE_THROW_DESC: "Lepaskan untuk membaling bom tangan!",
    TUT_GRENADE_THROW_TITLE2: "Baling Bom Tangan",
    TUT_GRENADE_THROW_DESC2: "Klik butang tetikus KIRI untuk membaling bom tangan!",
    TUT_GRENADE_ELIMINATE_TITLE: "Hapuskan Semua",
    TUT_GRENADE_ELIMINATE_DESC: "Hapuskan semua baki musuh!",
    TUT_GRENADE_ELIMINATE_TITLE2: "Hapuskan Semua",
    TUT_GRENADE_ELIMINATE_DESC2: "Hapuskan semua baki musuh!",
    TUT_SCORE_TITLE: "Skor & Kill",
    TUT_SCORE_DESC:
      "Itu sahaja! Anda boleh memantau SKOR dan KILL anda di sini! Ketik di mana-mana sahaja untuk terus bermain",
    TUT_SCORE_TITLE2: "Skor & Kill",
    TUT_SCORE_DESC2:
      "Itu sahaja! Anda boleh memantau SKOR dan KILL anda di sini! Klik di mana-mana sahaja untuk terus bermain",

    // Store
    STORE_TITLE: "KEDAI",
    STORE_GUNS: "SENJATA",
    STORE_POWERUPS: "POWER-UP",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "SHOTGUN",
    STORE_ROCKET_LAUNCHER: "PELANCUR ROKET",
    STORE_GRENADE: "GRANAT",
    STORE_AMMO_PACK: "PEK PELURU",
    STORE_BUY: "BELI",
    STORE_OWNED: "DIMILIKI",
    STORE_MAX_LIMIT: "HAD MAKSIMUM",
    STORE_CLOSE: "TUTUP",
    STORE_NOT_ENOUGH_CASH: "WANG TIDAK CUKUP!",
    STORE_PURCHASE_AGAIN: "Anda boleh membelinya semula di pusingan seterusnya!",
    SELECT_WEAPONS_TITLE: "PILIH SENJATA",
    SELECT_CONTINUE: "TERUSKAN",

    // Weapon Names
    RIFLE: "SENAPANG",
    SNIPER: "SNIPER",

    // Additional UI
    ON: "AKTIF",
    OFF: "MATI",
    TIP_LABEL: "TIP:",
    NEXT_WAVE: "GELOMBANG SETERUSNYA",
    PLAYER_NAME_TITLE: "NAMA PEMAIN",
  },

  it: {
    // Lobby & Settings
    SETTINGS: "IMPOSTAZIONI",
    CONTROLS: "CONTROLLI",
    CTRL_CLASSIC: "Classico",
    CTRL_HOLD_FIRE: "Tieni Premuto",
    SENSITIVITY: "SENSIBILITÀ",
    MUSIC: "MUSICA",
    SFX: "SFX",
    LANGUAGE: "LINGUA",
    CLOSE: "CHIUDI",
    START: "INIZIA",
    GO_TO_LOBBY: "VAI ALLA LOBBY",
    HIGHSCORE: "MIGLIOR PUNTI",
    MAX_KILLS: "UCC MASSIME",
    WELCOME_BACK: "Bentornato",
    PLAYER: "GIOCATORE",

    // HUD - Game
    HEALTH: "SALUTE",
    AMMO: "MUNIZIONI",
    SCORE: "PUNTI",
    KILLS: "UCC",
    WAVE: "ONDATA",
    COMBO: "COMBO",

    // Game Over Screen
    GAME_OVER: "GAME OVER",
    YOU_DIED: "SEI MORTO!",
    YOU_SURVIVED: "SEI SOPRAVVISSUTO!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "UCC FUCILE",
    SNIPER_KILLS: "UCC CECCHINO",

    // Rewarded Ad Popup
    RA_TITLE: "CONTINUARE?",
    RA_MESSAGE: "Guarda un annuncio per ripristinare la salute e continuare a giocare!",
    RA_WATCH_AD: "GUARDA L'ANNUNCIO",
    RA_NO_THANKS: "NO, GRAZIE",
    RA_HP_TEXT: "+100 HP",

    // Collectable Types
    MED_KIT: "KIT MEDICO",
    RIFLE_AMMO: "MUNIZIONI FUCILE",
    SNIPER_AMMO: "MUNIZIONI CECCHINO",
    GRENADE: "GRANATA",
    FULL_HP: "(SALUTE MAX)",
    FULL_AMMO: "(PIENO)",
    HP_SHORT: "HP",

    // Kill Types
    HEADSHOT: "HEADSHOT",
    BODYSHOT: "TIRO AL CORPO",
    KILLSTREAK: "SERIE DI UCC",

    // Tips & Messages
    TIP: "SUGGERIMENTO",
    KEEP_MOVING: "CONTINUA A MUOVERTI E USA I RIPARI PER SOPRAVVIVERE!",
    AIM_FOR_HEAD: "MIRA ALLA TESTA PER DANNI BONUS!",
    RELOAD_EARLY: "RICARICA PRIMA DEL NECESSARIO — NON DURANTE UNO SCONTRO!",
    USE_COVER: "USA I RIPARI PER SPORGERTI E SPARARE — RESTA NASCOSTO!",
    COMBO_BONUS: "COMBO PIÙ ALTA = BONUS PUNTI MAGGIORE!",
    ELIMINATE_ENEMIES:
      "ELIMINA TUTTI I NEMICI PER PASSARE ALL'ONDATA SUCCESSIVA!",
    GET_READY: "PREPARATI!",
    SURVIVE_STREETS: "SOPRAVVIVI IN STRADA PIÙ A LUNGO POSSIBILE!",
    LOADING: "CARICAMENTO...",
    LOADING_ASSETS: "Caricamento risorse…",

    // In-game Feedback
    AMMO_OUT: "MUNIZIONI ESAURITE!",
    WAVE_CLEAR: "ONDATA COMPLETATA!",
    WAVE_COMPLETE: "ONDATA COMPLETATA",

    // Player Name
    ENTER_NAME: "INSERISCI IL TUO NOME",
    TYPE_NAME: "Digita il nome",
    SAVE: "SALVA",
    EDIT_NAME: "Modifica nome giocatore",

    // Lobby labels
    WELCOME_BACK: "Bentornato",

    // Game Over
    GO_TO_LOBBY: "VAI ALLA LOBBY",
    SCORE: "PUNTI",

    // Kill feedback
    HEADSHOT: "HEADSHOT!",
    BODYSHOT: "TIRO AL CORPO",
    KILLSTREAK: "SERIE DI UCC",

    // Tutorial
    TUT_CAMERA_TITLE: "Mirino Telecamera",
    TUT_CAMERA_DESC:
      "Trascina lo schermo per vedere i nemici vicini",
    TUT_CAMERA_TITLE2: "Mirino Telecamera",
    TUT_CAMERA_DESC2: "Muovi il mouse per puntare la telecamera sui nemici",
    TUT_ADS_TITLE: "Mira con Mirino",
    TUT_ADS_DESC:
      "Tocca il pulsante del MIRINO a sinistra per usare il mirino e puntare con precisione",
    TUT_ADS_TITLE2: "Mira di Precisione",
    TUT_ADS_DESC2:
      "Tieni premuto il pulsante destro del mouse (clic DESTRO) per usare il mirino e puntare con precisione.",
    TUT_ADS_FIRE_TITLE: "Fuoco!",
    TUT_ADS_FIRE_DESC: "Regola la telecamera e tocca il pulsante di fuoco per sparare",
    TUT_ADS_FIRE_TITLE2: "Fuoco!",
    TUT_ADS_FIRE_DESC2: "Fai clic con il pulsante SINISTRO per sparare!",
    TUT_JOYSTICK_AIM_TITLE: "Tieni premuto per mirare",
    TUT_JOYSTICK_AIM_DESC: "Tieni premuto il pulsante di fuoco per mirare con precisione!",
    TUT_JOYSTICK_FIRE_TITLE: "Rilascia per sparare!",
    TUT_JOYSTICK_FIRE_DESC: "Rilascia il pulsante di fuoco per sparare al nemico!",
    TUT_GUN_SWITCH_TITLE: "Cambia Arma",
    TUT_GUN_SWITCH_DESC:
      "Tocca il pulsante di cambio arma per cambiare l'arma equipaggiata",
    TUT_GUN_SWITCH_TITLE2: "Cambia Arma",
    TUT_GUN_SWITCH_DESC2: "Premi TAB o i numeri 1 o 2, oppure ruota la rotella del mouse per cambiare arma",
    TUT_ELIMINATE_ALL_TITLE: "Elimina Tutti",
    TUT_ELIMINATE_ALL_DESC:
      "I nemici ti colpiscono solo mentre usi il mirino o quando fallisci il colpo",
    TUT_ELIMINATE_ALL_TITLE2: "Elimina Tutti",
    TUT_ELIMINATE_ALL_DESC2:
      "I nemici ti colpiscono solo mentre usi il mirino o quando fallisci il colpo",
    TUT_GRENADE_COLLECTED_TITLE: "Granata Raccolta!",
    TUT_GRENADE_COLLECTED_DESC:
      "Hai raccolto una GRANATA! Potrebbe anche essere un Medkit o delle Munizioni. Tocca per continuare",
    TUT_GRENADE_COLLECTED_TITLE2: "Granata Raccolta!",
    TUT_GRENADE_COLLECTED_DESC2:
      "Hai raccolto una GRANATA! Potrebbe anche essere un Medkit o delle Munizioni. Fai clic per continuare",
    TUT_GRENADE_EQUIP_TITLE: "Equipaggia Granata",
    TUT_GRENADE_EQUIP_DESC:
      "Tocca l'icona della GRANATA per equipaggiarla in mano",
    TUT_GRENADE_EQUIP_TITLE2: "Equipaggia Granata",
    TUT_GRENADE_EQUIP_DESC2: "Premi il tasto G o ruota la rotella del mouse per equipaggiare la granata in mano",
    TUT_GRENADE_AIM_TITLE: "Mira la Granata",
    TUT_GRENADE_AIM_DESC: "Tieni premuto il lato DESTRO dello schermo per mirare la traiettoria della granata!",
    TUT_GRENADE_AIM_TITLE2: "Mira la Granata",
    TUT_GRENADE_AIM_DESC2: "Tieni premuto il pulsante destro del mouse (clic DESTRO) per mirare la traiettoria della granata!",
    TUT_GRENADE_THROW_TITLE: "Lancia Granata",
    TUT_GRENADE_THROW_DESC: "Rilascia per lanciare la granata!",
    TUT_GRENADE_THROW_TITLE2: "Lancia Granata",
    TUT_GRENADE_THROW_DESC2: "Fai clic con il tasto SINISTRO del mouse per lanciare la granata!",
    TUT_GRENADE_ELIMINATE_TITLE: "Elimina Tutti",
    TUT_GRENADE_ELIMINATE_DESC: "Elimina tutti i nemici rimasti!",
    TUT_GRENADE_ELIMINATE_TITLE2: "Elimina Tutti",
    TUT_GRENADE_ELIMINATE_DESC2: "Elimina tutti i nemici rimasti!",
    TUT_SCORE_TITLE: "Punteggio ed Uccisioni",
    TUT_SCORE_DESC:
      "Tutto qui! Puoi tenere traccia del tuo PUNTEGGIO e delle UCCISIONI qui! Tocca un punto qualsiasi per continuare a giocare",
    TUT_SCORE_TITLE2: "Punteggio ed Uccisioni",
    TUT_SCORE_DESC2:
      "Tutto qui! Puoi tenere traccia del tuo PUNTEGGIO e delle UCCISIONI qui! Fai clic in un punto qualsiasi per continuare a giocare",

    // Store
    STORE_TITLE: "NEGOZIO",
    STORE_GUNS: "ARMI",
    STORE_POWERUPS: "POTENZIAMENTI",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "FUCILE A POMPA",
    STORE_ROCKET_LAUNCHER: "LANCIARAZZI",
    STORE_GRENADE: "GRANATA",
    STORE_AMMO_PACK: "PACCO MUNIZIONI",
    STORE_BUY: "ACQUISTA",
    STORE_OWNED: "POSSEDUTO",
    STORE_MAX_LIMIT: "LIMITE MASSIMO",
    STORE_CLOSE: "CHIUDI",
    STORE_NOT_ENOUGH_CASH: "DENARO INSUFFICIENTE!",
    STORE_PURCHASE_AGAIN: "Puoi acquistarlo di nuovo nel prossimo round!",
    SELECT_WEAPONS_TITLE: "SELEZIONA ARMI",
    SELECT_CONTINUE: "CONTINUA",

    // Weapon Names
    RIFLE: "FUCILE",
    SNIPER: "CECCHINO",

    // Additional UI
    ON: "ON",
    OFF: "OFF",
    TIP_LABEL: "SUGGERIMENTO:",
    NEXT_WAVE: "PROSSIMA ONDATA",
    PLAYER_NAME_TITLE: "NOME GIOCATORE",
  },

  nl: {
    // Lobby & Settings
    SETTINGS: "INSTELLINGEN",
    CONTROLS: "BESTURING",
    CTRL_CLASSIC: "Klassiek",
    CTRL_HOLD_FIRE: "Ingedrukt Houden",
    SENSITIVITY: "GEVOELIGHEID",
    MUSIC: "MUZIEK",
    SFX: "SFX",
    LANGUAGE: "TAAL",
    CLOSE: "SLUITEN",
    START: "START",
    GO_TO_LOBBY: "NAAR DE LOBBY",
    HIGHSCORE: "HIGHSCORE",
    MAX_KILLS: "MAX. KILLS",
    WELCOME_BACK: "Welkom terug",
    PLAYER: "SPELER",

    // HUD - Game
    HEALTH: "HP",
    AMMO: "MUNITIE",
    SCORE: "SCORE",
    KILLS: "KILLS",
    WAVE: "GOLF",
    COMBO: "COMBO",

    // Game Over Screen
    GAME_OVER: "GAME OVER",
    YOU_DIED: "JE BENT DOOD!",
    YOU_SURVIVED: "JE HEBT OVERLEEFD!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "GEWEER-KILLS",
    SNIPER_KILLS: "SNIPER-KILLS",

    // Rewarded Ad Popup
    RA_TITLE: "DOORGAAN?",
    RA_MESSAGE: "Bekijk een advertentie om je gezondheid te herstellen en verder te spelen!",
    RA_WATCH_AD: "ADVERTENTIE BEKIJKEN",
    RA_NO_THANKS: "NEE BEDANKT",
    RA_HP_TEXT: "+100 HP",

    // Collectable Types
    MED_KIT: "MEDIKIT",
    RIFLE_AMMO: "GEWEERMUNITIE",
    SNIPER_AMMO: "SNIPERMUNITIE",
    GRENADE: "GRANAAT",
    FULL_HP: "(VOL HEALTH)",
    FULL_AMMO: "(VOL)",
    HP_SHORT: "HP",

    // Kill Types
    HEADSHOT: "HEADSHOT",
    BODYSHOT: "BODYSHOT",
    KILLSTREAK: "KILLSTREAK",

    // Tips & Messages
    TIP: "TIP",
    KEEP_MOVING: "BLIJF IN BEWEGING EN GEBRUIK DEKKING OM IN LEVEN TE BLIJVEN!",
    AIM_FOR_HEAD: "RICHT OP HET HOOFD VOOR BONUSSCHADE!",
    RELOAD_EARLY: "HERLAAD VOORDAT HET MOET — NIET TIJDENS EEN GEVECHT!",
    USE_COVER: "GEBRUIK DEKKING OM TE GLUREN EN TE SCHIETEN — BLIJF VERBORGEN!",
    COMBO_BONUS: "HOGERE COMBO = GROTERE SCOREBONUS!",
    ELIMINATE_ENEMIES:
      "ELIMINEER ALLE VIANDEN OM DOOR TE GAAN NAAR DE VOLGENDE GOLF!",
    GET_READY: "MAAK JE GEREED!",
    SURVIVE_STREETS: "OVERLEEF ZO LANG MOGELIJK OP STRAAT!",
    LOADING: "LADEN...",
    LOADING_ASSETS: "Middelen laden…",

    // In-game Feedback
    AMMO_OUT: "GEEN MUNITIE MEER!",
    WAVE_CLEAR: "GOLF VOLTOOID!",
    WAVE_COMPLETE: "GOLF VOLTOOID",

    // Player Name
    ENTER_NAME: "VOER JE NAAM IN",
    TYPE_NAME: "Typ naam",
    SAVE: "OPSLAAN",
    EDIT_NAME: "Spelersnaam bewerken",

    // Lobby labels
    WELCOME_BACK: "Welkom terug",

    // Game Over
    GO_TO_LOBBY: "NAAR DE LOBBY",
    SCORE: "SCORE",

    // Kill feedback
    HEADSHOT: "HEADSHOT!",
    BODYSHOT: "BODYSHOT",
    KILLSTREAK: "KILLSTREAK",

    // Tutorial
    TUT_CAMERA_TITLE: "Camerarichtpunt",
    TUT_CAMERA_DESC:
      "Sleep over het scherm om vijanden in de buurt te zien",
    TUT_CAMERA_TITLE2: "Camerarichtpunt",
    TUT_CAMERA_DESC2: "Beweeg je muis om je camera op de vijanden te richten",
    TUT_ADS_TITLE: "Vizier-richten",
    TUT_ADS_DESC:
      "Tik op de VIZIER-knop aan de linkerkant om door het vizier te kijken en nauwkeurig te richten",
    TUT_ADS_TITLE2: "Precisierichtpunt",
    TUT_ADS_DESC2:
      "Houd de RECHTERMUISKNOP ingedrukt om in te zoomen door het vizier en nauwkeurig te richten.",
    TUT_ADS_FIRE_TITLE: "Vuur!",
    TUT_ADS_FIRE_DESC: "Pas de camera aan en tik op vuren om te schieten",
    TUT_ADS_FIRE_TITLE2: "Vuur!",
    TUT_ADS_FIRE_DESC2: "Klik op de LINKERMUISKNOP om te vuren!",
    TUT_JOYSTICK_AIM_TITLE: "Vasthouden om te Richten",
    TUT_JOYSTICK_AIM_DESC: "Houd de vuurknop ingedrukt om te richten!",
    TUT_JOYSTICK_FIRE_TITLE: "Loslaten om te Schieten!",
    TUT_JOYSTICK_FIRE_DESC: "Laat de vuurknop los om op de vijand te schieten!",
    TUT_GUN_SWITCH_TITLE: "Wapen wisselen",
    TUT_GUN_SWITCH_DESC: "Tik op de wapenwisselknop om van wapen te wisselen",
    TUT_GUN_SWITCH_TITLE2: "Wapen wisselen",
    TUT_GUN_SWITCH_DESC2: "Druk op TAB, de cijfers 1 of 2 of scrol met je muiswiel om van wapen te veranderen",
    TUT_ELIMINATE_ALL_TITLE: "Elimineer iedereen",
    TUT_ELIMINATE_ALL_DESC:
      "Vijanden raken je alleen terwijl je door het vizier kijkt of als je je schot mist",
    TUT_ELIMINATE_ALL_TITLE2: "Elimineer iedereen",
    TUT_ELIMINATE_ALL_DESC2:
      "Vijanden raken je alleen terwijl je door het vizier kijkt of als je je schot mist",
    TUT_GRENADE_COLLECTED_TITLE: "Granaat Verzameld!",
    TUT_GRENADE_COLLECTED_DESC:
      "Je hebt een GRANAAT verzameld! Het kan ook een EHBO-kit of munitie zijn. Tik om door te gaan",
    TUT_GRENADE_COLLECTED_TITLE2: "Granaat Verzameld!",
    TUT_GRENADE_COLLECTED_DESC2:
      "Je hebt een GRANAAT verzameld! Het kan ook een EHBO-kit of munitie zijn. Klik om door te gaan",
    TUT_GRENADE_EQUIP_TITLE: "Granaat Selecteren",
    TUT_GRENADE_EQUIP_DESC:
      "Tik op het GRANAAT-icoon om deze in je hand te nemen",
    TUT_GRENADE_EQUIP_TITLE2: "Granaat Selecteren",
    TUT_GRENADE_EQUIP_DESC2: "Druk op de G-toets of scrol met het muiswiel om de granaat in je hand te nemen",
    TUT_GRENADE_AIM_TITLE: "Granaat richten",
    TUT_GRENADE_AIM_DESC: "Houd de RECHTERKANT van het scherm ingedrukt om de granaatbaan te richten!",
    TUT_GRENADE_AIM_TITLE2: "Granaat richten",
    TUT_GRENADE_AIM_DESC2: "Houd de RECHTERMUISKNOP ingedrukt om de granaatbaan te richten!",
    TUT_GRENADE_THROW_TITLE: "Granaat werpen",
    TUT_GRENADE_THROW_DESC: "Laat los om de granaat te werpen!",
    TUT_GRENADE_THROW_TITLE2: "Granaat werpen",
    TUT_GRENADE_THROW_DESC2: "Klik op de LINKERMUISKNOP om de granaat te werpen!",
    TUT_GRENADE_ELIMINATE_TITLE: "Elimineer iedereen",
    TUT_GRENADE_ELIMINATE_DESC: "Elimineer alle overgebleven vijanden!",
    TUT_GRENADE_ELIMINATE_TITLE2: "Elimineer iedereen",
    TUT_GRENADE_ELIMINATE_DESC2: "Elimineer alle overgebleven vijanden!",
    TUT_SCORE_TITLE: "Score & Kills",
    TUT_SCORE_DESC:
      "Dat is het! Je kunt je SCORE en KILLS hier volgen! Tik ergens om verder te spelen",
    TUT_SCORE_TITLE2: "Score & Kills",
    TUT_SCORE_DESC2:
      "Dat is het! Je kunt je SCORE en KILLS hier volgen! Klik ergens om verder te spelen",

    // Store
    STORE_TITLE: "WINKEL",
    STORE_GUNS: "WAPENS",
    STORE_POWERUPS: "POWER-UPS",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "SHOTGUN",
    STORE_ROCKET_LAUNCHER: "RAKETWERPER",
    STORE_GRENADE: "GRANAAT",
    STORE_AMMO_PACK: "MUNITIESET",
    STORE_BUY: "KOPEN",
    STORE_OWNED: "IN BEZIT",
    STORE_MAX_LIMIT: "MAX. LIMIET",
    STORE_CLOSE: "SLUITEN",
    STORE_NOT_ENOUGH_CASH: "NIET GENOEG GELD!",
    STORE_PURCHASE_AGAIN: "Je kunt dit de volgende ronde opnieuw kopen!",
    SELECT_WEAPONS_TITLE: "WAPENS SELECTEREN",
    SELECT_CONTINUE: "DOORGAAN",

    // Weapon Names
    RIFLE: "GEWEER",
    SNIPER: "SCHERPSCHUTTER",

    // Additional UI
    ON: "AAN",
    OFF: "UIT",
    TIP_LABEL: "TIP:",
    NEXT_WAVE: "VOLGENDE GOLF",
    PLAYER_NAME_TITLE: "SPELERNAAM",
  },

  ro: {
    // Lobby & Settings
    SETTINGS: "SETĂRI",
    CONTROLS: "CONTROALE",
    CTRL_CLASSIC: "Clasic",
    CTRL_HOLD_FIRE: "Apasă Lung",
    SENSITIVITY: "SENSIBILITATE",
    MUSIC: "MUZICĂ",
    SFX: "SFX",
    LANGUAGE: "LIMBĂ",
    CLOSE: "ÎNCHIDE",
    START: "START",
    GO_TO_LOBBY: "MERGI ÎN LOBBY",
    HIGHSCORE: "RECORD",
    MAX_KILLS: "MAX. KILLS",
    WELCOME_BACK: "Bine ai revenit",
    PLAYER: "JUCĂTOR",

    // HUD - Game
    HEALTH: "HP",
    AMMO: "MUNIȚIE",
    SCORE: "SCOR",
    KILLS: "KILLS",
    WAVE: "VAL",
    COMBO: "COMBO",

    // Game Over Screen
    GAME_OVER: "SFÂRȘITUL JOCULUI",
    YOU_DIED: "AI MURIT!",
    YOU_SURVIVED: "AI SUPRAVIEȚUIT!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "KILLS CU ARMA",
    SNIPER_KILLS: "KILLS CU SNIPER",

    // Rewarded Ad Popup
    RA_TITLE: "CONTINUI?",
    RA_MESSAGE: "Urmărește o reclamă pentru a-ți recupera viața și a continua să joci!",
    RA_WATCH_AD: "VEZI RECLAMA",
    RA_NO_THANKS: "NU, MULȚUMESC",
    RA_HP_TEXT: "+100 HP",

    // Collectable Types
    MED_KIT: "TRUSĂ MEDICALĂ",
    RIFLE_AMMO: "MUNIȚIE PENTRU ARMĂ",
    SNIPER_AMMO: "MUNIȚIE SNIPER",
    GRENADE: "GRENADĂ",
    FULL_HP: "(SĂNĂTATE MAX)",
    FULL_AMMO: "(PLIN)",
    HP_SHORT: "HP",

    // Kill Types
    HEADSHOT: "HEADSHOT",
    BODYSHOT: "LOVITURĂ ÎN CORP",
    KILLSTREAK: "SERIE DE KILLS",

    // Tips & Messages
    TIP: "SFAT",
    KEEP_MOVING:
      "FII ÎN MIȘCARE ȘI FOLOSEȘTE ACOPERIREA CA SĂ SUPRAVIEȚUIEȘTI!",
    AIM_FOR_HEAD: "ȚINTEȘTE CAPUL PENTRU DAUNE SUPLIMENTARE!",
    RELOAD_EARLY: "REÎNCARCĂ ÎNAINTE SĂ AI NEVOIE — NU ÎN TIMPUL LUPTEI!",
    USE_COVER: "FOLOSEȘTE ACOPERIREA CA SĂ TRAGI — RĂMÂI ASCUNS!",
    COMBO_BONUS: "COMBO MAI MARE = BONUS DE SCOR MAI MARE!",
    ELIMINATE_ENEMIES: "ELIMINĂ TOȚI INAMICII PENTRU A TRECE LA URMĂTORUL VAL!",
    GET_READY: "PREGĂTEȘTE-TE!",
    SURVIVE_STREETS: "SUPRAVIEȚUIEȘTE PE STRĂZI CÂT MAI MULT POSIBIL!",
    LOADING: "SE ÎNCARCĂ...",
    LOADING_ASSETS: "Se încarcă resursele…",

    // In-game Feedback
    AMMO_OUT: "FĂRĂ MUNIȚIE!",
    WAVE_CLEAR: "VAL CURĂȚAT!",
    WAVE_COMPLETE: "VAL FINALIZAT",

    // Player Name
    ENTER_NAME: "INTRODUCE NUMELE TĂU",
    TYPE_NAME: "Scrie numele",
    SAVE: "SALVEAZĂ",
    EDIT_NAME: "Editează numele jucătorului",

    // Lobby labels
    WELCOME_BACK: "Bine ai revenit",

    // Game Over
    GO_TO_LOBBY: "MERGI ÎN LOBBY",
    SCORE: "SCOR",

    // Kill feedback
    HEADSHOT: "HEADSHOT!",
    BODYSHOT: "LOVITURĂ ÎN CORP",
    KILLSTREAK: "SERIE DE KILLS",

    // Tutorial
    TUT_CAMERA_TITLE: "Țintă Cameră",
    TUT_CAMERA_DESC:
      "Trage de ecran pentru a vedea inamicii din apropiere",
    TUT_CAMERA_TITLE2: "Țintă Cameră",
    TUT_CAMERA_DESC2: "Mișcă mouse-ul pentru a orienta camera către inamici",
    TUT_ADS_TITLE: "Ocheală prin Lunetă",
    TUT_ADS_DESC:
      "Atinge butonul LUNETĂ din stânga pentru a privi prin lunetă și a ochi cu precizie",
    TUT_ADS_TITLE2: "Ocheală de Precizie",
    TUT_ADS_DESC2:
      "Ține apăsat pe butonul click DREAPTA pentru a privi prin lunetă și a ochi cu precizie.",
    TUT_ADS_FIRE_TITLE: "Foc!",
    TUT_ADS_FIRE_DESC: "Ajustează camera și atinge butonul de foc pentru a trage",
    TUT_ADS_FIRE_TITLE2: "Foc!",
    TUT_ADS_FIRE_DESC2: "Apasă click STÂNGA pentru a trage!",
    TUT_JOYSTICK_AIM_TITLE: "Ține apăsat pentru a Ținti",
    TUT_JOYSTICK_AIM_DESC: "Ține apăsat butonul de foc pentru a ținti cu precizie!",
    TUT_JOYSTICK_FIRE_TITLE: "Eliberează pentru a Trage!",
    TUT_JOYSTICK_FIRE_DESC: "Eliberează butonul de foc pentru a trage în inamic!",
    TUT_GUN_SWITCH_TITLE: "Schimbă Arma",
    TUT_GUN_SWITCH_DESC:
      "Atinge butonul de schimbare a armei pentru a schimba arma echipată",
    TUT_GUN_SWITCH_TITLE2: "Schimbă Arma",
    TUT_GUN_SWITCH_DESC2: "Apasă tasta TAB sau numerele 1 sau 2, sau rotește rotița mouse-ului pentru a schimba arma",
    TUT_ELIMINATE_ALL_TITLE: "Elimină-i pe Toți",
    TUT_ELIMINATE_ALL_DESC:
      "Inamicii te lovesc doar când privești prin lunetă sau când ratezi lovitura",
    TUT_ELIMINATE_ALL_TITLE2: "Elimină-i pe Toți",
    TUT_ELIMINATE_ALL_DESC2:
      "Inamicii te lovesc doar când privești prin lunetă sau când ratezi lovitura",
    TUT_GRENADE_COLLECTED_TITLE: "Granată Colectată!",
    TUT_GRENADE_COLLECTED_DESC:
      "Ai colectat o GRANATĂ! Ar putea fi de asemenea o trusă medicală sau muniție. Atinge pentru a continua",
    TUT_GRENADE_COLLECTED_TITLE2: "Granată Colectată!",
    TUT_GRENADE_COLLECTED_DESC2:
      "Ai colectat o GRANATĂ! Ar putea fi de asemenea o trusă medicală sau muniție. Click pentru a continua",
    TUT_GRENADE_EQUIP_TITLE: "Echipează Granata",
    TUT_GRENADE_EQUIP_DESC: "Atinge pictograma GRANATĂ pentru a o lua în mână",
    TUT_GRENADE_EQUIP_TITLE2: "Echipează Granata",
    TUT_GRENADE_EQUIP_DESC2: "Apasă tasta G sau rotește rotița mouse-ului pentru a lua granata în mână",
    TUT_GRENADE_AIM_TITLE: "Ochește cu Granata",
    TUT_GRENADE_AIM_DESC: "Ține apăsat pe partea DREAPTĂ a ecranului pentru a ochi traiectoria granatei!",
    TUT_GRENADE_AIM_TITLE2: "Ochește cu Granata",
    TUT_GRENADE_AIM_DESC2: "Ține apăsat pe butonul click DREAPTA pentru a ochi traiectoria granatei!",
    TUT_GRENADE_THROW_TITLE: "Aruncă Granata",
    TUT_GRENADE_THROW_DESC: "Eliberează pentru a arunca granata!",
    TUT_GRENADE_THROW_TITLE2: "Aruncă Granata",
    TUT_GRENADE_THROW_DESC2: "Apasă click STÂNGA pentru a arunca granata!",
    TUT_GRENADE_ELIMINATE_TITLE: "Elimină-i pe Toți",
    TUT_GRENADE_ELIMINATE_DESC: "Elimină toți inamicii rămași!",
    TUT_GRENADE_ELIMINATE_TITLE2: "Elimină-i pe Toți",
    TUT_GRENADE_ELIMINATE_DESC2: "Elimină toți inamicii rămași!",
    TUT_SCORE_TITLE: "Scor și Eliminări",
    TUT_SCORE_DESC:
      "Asta-i tot! Îți poți urmări SCORUL și ELIMINĂRILE aici! Atinge oriunde pentru a continua jocul",
    TUT_SCORE_TITLE2: "Scor și Eliminări",
    TUT_SCORE_DESC2:
      "Asta-i tot! Îți poți urmări SCORUL și ELIMINĂRILE aici! Click oriunde pentru a continua jocul",

    // Store
    STORE_TITLE: "MAGAZIN",
    STORE_GUNS: "ARME",
    STORE_POWERUPS: "POWER-UP-URI",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "PUȘCĂ CU ALICE",
    STORE_ROCKET_LAUNCHER: "LANSATOR DE RACHETE",
    STORE_GRENADE: "GRANATĂ",
    STORE_AMMO_PACK: "PACHET MUNIȚIE",
    STORE_BUY: "CUMPĂRĂ",
    STORE_OWNED: "DEȚINUT",
    STORE_MAX_LIMIT: "LIMITĂ MAXIMĂ",
    STORE_CLOSE: "ÎNCHIDE",
    STORE_NOT_ENOUGH_CASH: "BANI INSUFICIENȚI!",
    STORE_PURCHASE_AGAIN: "Poți cumpăra din nou în runda următoare!",
    SELECT_WEAPONS_TITLE: "SELECTEAZĂ ARMELE",
    SELECT_CONTINUE: "CONTINUĂ",

    // Weapon Names
    RIFLE: "PUȘCĂ",
    SNIPER: "SNIPER",

    // Additional UI
    ON: "PORNIT",
    OFF: "OPRIT",
    TIP_LABEL: "SFAT:",
    NEXT_WAVE: "URMĂTORUL VAL",
    PLAYER_NAME_TITLE: "NUME JUCĂTOR",
  },

  th: {
    // Lobby & Settings
    SETTINGS: "ตั้งค่า",
    CONTROLS: "การควบคุม",
    CTRL_CLASSIC: "คลาสสิก",
    CTRL_HOLD_FIRE: "กดค้างเพื่อยิง",
    SENSITIVITY: "ความไว",
    MUSIC: "ดนตรี",
    SFX: "เอฟเฟกต์",
    LANGUAGE: "ภาษา",
    CLOSE: "ปิด",
    START: "เริ่ม",
    GO_TO_LOBBY: "ไปที่ล็อบบี้",
    HIGHSCORE: "คะแนนสูงสุด",
    MAX_KILLS: "การฆ่าสูงสุด",
    WELCOME_BACK: "ยินดีต้อนรับกลับมา",
    PLAYER: "ผู้เล่น",

    // HUD - Game
    HEALTH: "พลังชีวิต",
    AMMO: "กระสุน",
    SCORE: "คะแนน",
    KILLS: "การฆ่า",
    WAVE: "เวฟ",
    COMBO: "คอมโบ",

    // Game Over Screen
    GAME_OVER: "เกมโอเวอร์",
    YOU_DIED: "คุณตายแล้ว!",
    YOU_SURVIVED: "คุณรอดชีวิตแล้ว!",
    AK47: "AK47",
    AWM: "AWM",
    RIFLE_KILLS: "สังหารด้วยไรเฟิล",
    SNIPER_KILLS: "สังหารด้วยสไนเปอร์",

    // Rewarded Ad Popup
    RA_TITLE: "เล่นต่อ?",
    RA_MESSAGE: "ดูโฆษณาเพื่อฟื้นฟูพลังชีวิตและเล่นต่อ!",
    RA_WATCH_AD: "ดูโฆษณา",
    RA_NO_THANKS: "ไม่ ขอบคุณ",
    RA_HP_TEXT: "+100 HP",

    // Collectable Types
    MED_KIT: "กล่องยา",
    RIFLE_AMMO: "กระสุนไรเฟิล",
    SNIPER_AMMO: "กระสุนสไนเปอร์",
    GRENADE: "ระเบิดมือ",
    FULL_HP: "(พลังชีวิตเต็ม)",
    FULL_AMMO: "(เต็ม)",
    HP_SHORT: "HP",

    // Kill Types
    HEADSHOT: "เฮดช็อต",
    BODYSHOT: "ยิงโดนตัว",
    KILLSTREAK: "คิลสตรีค",

    // Tips & Messages
    TIP: "คำแนะนำ",
    KEEP_MOVING: "เคลื่อนที่ต่อไปและใช้ที่กำบังเพื่อเอาชีวิตรอด!",
    AIM_FOR_HEAD: "เล็งที่หัวเพื่อความเสียหายโบนัส!",
    RELOAD_EARLY: "รีโหลดกระสุนก่อนจะจำเป็น — อย่ารีโหลดระหว่างการต่อสู้!",
    USE_COVER: "ใช้ที่กำบังเพื่อแอบดูและยิง — ซ่อนตัวไว้!",
    COMBO_BONUS: "คอมโบที่สูงกว่า = คะแนนโบนัสที่มากกว่า!",
    ELIMINATE_ENEMIES: "กำจัดศัตรูทั้งหมดเพื่อก้าวไปสู่เวฟต่อไป!",
    GET_READY: "เตรียมตัวให้พร้อม!",
    SURVIVE_STREETS: "เอาชีวิตรอดบนท้องถนนให้ยาวนานที่สุดเท่าที่คุณจะทำได้!",
    LOADING: "กำลังโหลด...",
    LOADING_ASSETS: "กำลังโหลดข้อมูล...",

    // In-game Feedback
    AMMO_OUT: "กระสุนหมด!",
    WAVE_CLEAR: "เคลียร์เวฟแล้ว!",
    WAVE_COMPLETE: "เวฟเสร็จสิ้น",

    // Player Name
    ENTER_NAME: "ป้อนชื่อของคุณ",
    TYPE_NAME: "พิมพ์ชื่อ",
    SAVE: "บันทึก",
    EDIT_NAME: "แก้ไขชื่อผู้เล่น",

    // Lobby labels
    WELCOME_BACK: "ยินดีต้อนรับกลับมา",

    // Game Over
    GO_TO_LOBBY: "ไปที่ล็อบบี้",
    SCORE: "คะแนน",

    // Kill feedback
    HEADSHOT: "เฮดช็อต!",
    BODYSHOT: "ยิงโดนตัว",
    KILLSTREAK: "คิลสตรีค",

    // Tutorial
    TUT_CAMERA_TITLE: "มุมกล้อง",
    TUT_CAMERA_DESC: "ลากหน้าจอเพื่อดูศัตรูที่อยู่ใกล้ๆ",
    TUT_CAMERA_TITLE2: "มุมกล้อง",
    TUT_CAMERA_DESC2: "เลื่อนเมาส์เพื่อหันมุมกล้องไปยังศัตรู",
    TUT_ADS_TITLE: "เล็งผ่านกล้อง",
    TUT_ADS_DESC:
      "แตะปุ่มกล้องเล็ง (SCOPE) ทางซ้ายเพื่อซูมกล้องเล็งและเล็งอย่างแม่นยำ",
    TUT_ADS_TITLE2: "เล็งประณีต",
    TUT_ADS_DESC2: "คลิกขวาค้างเพื่อซูมกล้องเล็งและเล็งอย่างแม่นยำ",
    TUT_ADS_FIRE_TITLE: "ยิง!",
    TUT_ADS_FIRE_DESC: "ปรับมุมกล้องและแตะปุ่มยิงเพื่อยิง",
    TUT_ADS_FIRE_TITLE2: "ยิง!",
    TUT_ADS_FIRE_DESC2: "คลิกซ้ายเพื่อยิง!",
    TUT_JOYSTICK_AIM_TITLE: "กดค้างเพื่อเล็ง",
    TUT_JOYSTICK_AIM_DESC: "กดปุ่มยิงค้างไว้เพื่อซูมและเล็งอย่างแม่นยำ!",
    TUT_JOYSTICK_FIRE_TITLE: "ปล่อยเพื่อยิง!",
    TUT_JOYSTICK_FIRE_DESC: "ปล่อยปุ่มยิงเพื่อยิงศัตรู!",
    TUT_GUN_SWITCH_TITLE: "สลับอาวุธ",
    TUT_GUN_SWITCH_DESC: "แตะปุ่มสลับอาวุธเพื่อเปลี่ยนอาวุธ",
    TUT_GUN_SWITCH_TITLE2: "สลับอาวุธ",
    TUT_GUN_SWITCH_DESC2: "กด TAB หรือปุ่มตัวเลข 1 หรือ 2 หรือหมุนลูกกลิ้งเมาส์เพื่อเปลี่ยนอาวุธ",
    TUT_ELIMINATE_ALL_TITLE: "กำจัดทั้งหมด",
    TUT_ELIMINATE_ALL_DESC:
      "ศัตรูจะยิงโดนคุณเฉพาะตอนที่คุณซูมกล้องเล็งหรือตอนคุณยิงพลาดเท่านั้น",
    TUT_ELIMINATE_ALL_TITLE2: "กำจัดทั้งหมด",
    TUT_ELIMINATE_ALL_DESC2:
      "ศัตรูจะยิงโดนคุณเฉพาะตอนที่คุณซูมกล้องเล็งหรือตอนคุณยิงพลาดเท่านั้น",
    TUT_GRENADE_COLLECTED_TITLE: "เก็บระเบิดได้!",
    TUT_GRENADE_COLLECTED_DESC:
      "คุณเก็บระเบิดมือได้! ของสิ่งนี้อาจเป็นกล่องพยาบาลหรือกระสุนก็ได้เช่นกัน แตะเพื่อเล่นต่อ",
    TUT_GRENADE_COLLECTED_TITLE2: "เก็บระเบิดได้!",
    TUT_GRENADE_COLLECTED_DESC2:
      "คุณเก็บระเบิดมือได้! ของสิ่งนี้อาจเป็นกล่องพยาบาลหรือกระสุนก็ได้เช่นกัน คลิกเพื่อเล่นต่อ",
    TUT_GRENADE_EQUIP_TITLE: "ติดตั้งระเบิดมือ",
    TUT_GRENADE_EQUIP_DESC: "แตะที่ไอคอนระเบิดมือเพื่อถือมันไว้ในมือ",
    TUT_GRENADE_EQUIP_TITLE2: "ติดตั้งระเบิดมือ",
    TUT_GRENADE_EQUIP_DESC2: "กดปุ่ม G หรือหมุนลูกกลิ้งเมาส์เพื่อถือระเบิดมือไว้ในมือ",
    TUT_GRENADE_AIM_TITLE: "เล็งระเบิดมือ",
    TUT_GRENADE_AIM_DESC: "กดค้างที่หน้าจอฝั่งขวาเพื่อเล็งวิถีการปาระเบิดมือ!",
    TUT_GRENADE_AIM_TITLE2: "เล็งระเบิดมือ",
    TUT_GRENADE_AIM_DESC2: "คลิกขวาค้างเพื่อเล็งวิถีการปาระเบิดมือ!",
    TUT_GRENADE_THROW_TITLE: "ปาระเบิด",
    TUT_GRENADE_THROW_DESC: "ปล่อยเพื่อปาระเบิดมือ!",
    TUT_GRENADE_THROW_TITLE2: "ปาระเบิด",
    TUT_GRENADE_THROW_DESC2: "คลิกซ้ายเพื่อปาระเบิดมือ!",
    TUT_GRENADE_ELIMINATE_TITLE: "กำจัดทั้งหมด",
    TUT_GRENADE_ELIMINATE_DESC: "กำจัดศัตรูที่เหลืออยู่ทั้งหมด!",
    TUT_GRENADE_ELIMINATE_TITLE2: "กำจัดทั้งหมด",
    TUT_GRENADE_ELIMINATE_DESC2: "กำจัดศัตรูที่เหลืออยู่ทั้งหมด!",
    TUT_SCORE_TITLE: "คะแนนและจำนวนคิล",
    TUT_SCORE_DESC:
      "เท่านี้แหละ! คุณสามารถติดตามคะแนนและจำนวนคิลของคุณได้ที่นี่! แตะตรงไหนก็ได้เพื่อเล่นต่อ",
    TUT_SCORE_TITLE2: "คะแนนและจำนวนคิล",
    TUT_SCORE_DESC2:
      "เท่านี้แหละ! คุณสามารถติดตามคะแนนและจำนวนคิลของคุณได้ที่นี่! คลิกตรงไหนก็ได้เพื่อเล่นต่อ",

    // Store
    STORE_TITLE: "ร้านค้า",
    STORE_GUNS: "อาวุธปืน",
    STORE_POWERUPS: "พาวเวอร์อัป",
    STORE_MAC10: "MAC10",
    STORE_SHOTGUN: "ปืนลูกซอง",
    STORE_ROCKET_LAUNCHER: "เครื่องยิงจรวด",
    STORE_GRENADE: "ระเบิดมือ",
    STORE_AMMO_PACK: "แพ็กกระสุน",
    STORE_BUY: "ซื้อ",
    STORE_OWNED: "มีแล้ว",
    STORE_MAX_LIMIT: "ขีดจำกัดสูงสุด",
    STORE_CLOSE: "ปิด",
    STORE_NOT_ENOUGH_CASH: "เงินไม่พอ!",
    STORE_PURCHASE_AGAIN: "คุณสามารถซื้อได้อีกครั้งในรอบถัดไป!",
    SELECT_WEAPONS_TITLE: "เลือกอาวุธ",
    SELECT_CONTINUE: "เล่นต่อ",

    // Weapon Names
    RIFLE: "ปืนไรเฟิล",
    SNIPER: "ปืนซุ่มยิง",

    // Additional UI
    ON: "เปิด",
    OFF: "ปิด",
    TIP_LABEL: "คำแนะนำ:",
    NEXT_WAVE: "เวฟถัดไป",
    PLAYER_NAME_TITLE: "ชื่อผู้เล่น",
  },
};

export default translations;
