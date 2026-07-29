// shoot.js — Player Bullet System: Three.js Raycasting, Hit Detection, FX

import * as THREE from "three";
import {
  playerState,
  consumeAmmo,
  applyRecoil,
  WEAPON_RIFLE,
  WEAPON_SNIPER,
  WEAPON_SHOTGUN,
  WEAPON_ROCKET,
  WEAPON_MAC10,
} from "./player.js";
import { getWeaponConfig } from "./weapons.js";
import { getFromPool, releaseToPool } from "./pool.js";
import { playSound } from "./audio.js";
import {
  getMac10BurstSettings,
  shouldApplyBurstScore,
} from "./mac10-burst.mjs";

const _raycaster = new THREE.Raycaster();
_raycaster.near = 0.1;
_raycaster.far = 200;

/* ── Main fire function ──────────────────────────────────── */
export function firePlayerBullet(
  scene,
  camera,
  enemies,
  hud,
  addScoreFn,
  waveConfig,
  onKill,
  onRocketExplode, // (explodePos, radius, damage) => void
) {
  const wid = playerState.activeWeapon;
  const cfg = getWeaponConfig(wid);

  if (wid === WEAPON_MAC10) {
    _fireMac10(scene, camera, enemies, hud, addScoreFn, waveConfig, onKill);
    return;
  }

  if (!consumeAmmo()) {
    playSound("empty-gun", "emptyGun");
    hud?.showPopup?.("NO AMMO", "warn");
    return;
  }

  applyRecoil(0.028);
  _spawnMuzzleFlash(scene, camera);

  if (wid === WEAPON_ROCKET) {
    _fireRocket(
      scene,
      camera,
      enemies,
      hud,
      addScoreFn,
      waveConfig,
      onKill,
      onRocketExplode,
    );
    return;
  }

  if (wid === WEAPON_SHOTGUN) {
    _fireShotgun(scene, camera, enemies, hud, addScoreFn, waveConfig, onKill);
    return;
  }

  _fireHitscan(
    scene,
    camera,
    enemies,
    hud,
    addScoreFn,
    waveConfig,
    onKill,
    wid,
  );
}

/* ── Hitscan fire (rifle / sniper) ───────────────────────── */
function _fireHitscan(
  scene,
  camera,
  enemies,
  hud,
  addScoreFn,
  waveConfig,
  onKill,
  wid,
) {
  const _rayOrigin = new THREE.Vector3();
  const _rayDir = new THREE.Vector3();
  camera.getWorldPosition(_rayOrigin);
  camera.getWorldDirection(_rayDir);
  const _shotRay = new THREE.Ray(_rayOrigin, _rayDir);

  let boneHitEnemy = null;
  let boneHitZone = null;
  let boneHitDist = Infinity;

  for (const enemy of enemies) {
    if (enemy.isDead || !enemy.root || !enemy.skeleton) continue;
    const result = enemy.checkRayHit(_shotRay);
    if (result && result.dist < boneHitDist) {
      boneHitDist = result.dist;
      boneHitEnemy = enemy;
      boneHitZone = result.zone;
    }
  }

  const meshToEnemy = new Map();
  const allMeshes = [];
  for (const enemy of enemies) {
    if (enemy.isDead || !enemy.root || enemy.skeleton) continue;
    enemy.root.traverse((obj) => {
      if (obj.isMesh) {
        meshToEnemy.set(obj, enemy);
        allMeshes.push(obj);
      }
    });
  }
  _raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const meshHits = allMeshes.length
    ? _raycaster.intersectObjects(allMeshes, false)
    : [];

  const skeletonMeshes = [];
  for (const enemy of enemies) {
    if (enemy.isDead || !enemy.root || !enemy.skeleton) continue;
    enemy.root.traverse((obj) => {
      if (obj.isMesh) skeletonMeshes.push(obj);
    });
  }
  const skelMeshHits = skeletonMeshes.length
    ? _raycaster.intersectObjects(skeletonMeshes, false)
    : [];

  const allHits = [...meshHits, ...skelMeshHits].sort(
    (a, b) => a.distance - b.distance,
  );

  const isSniper = wid === WEAPON_SNIPER;
  playSound(
    isSniper ? "sniper-shot" : "ak47-shot",
    isSniper ? "sniper" : "rifles",
  );
  playSound("gun-shell-drop", "shellDrop", 0.6);

  const meshHitEnemy = meshHits.length
    ? meshToEnemy.get(meshHits[0].object)
    : null;
  const missed = !boneHitEnemy && !meshHitEnemy;

  if (missed) {
    _handleMiss(scene, camera, enemies, waveConfig);
    return;
  }

  const enemy = boneHitEnemy ?? meshHitEnemy;
  const hitZone = boneHitZone ?? "body";
  const isHeadshot = hitZone === "head";

  setTimeout(() => {
    playSound(
      isHeadshot ? "headshot-hit" : "body-hit",
      isHeadshot ? "headshotHit" : "bodyHit",
    );
  }, 80);

  const cfg = getWeaponConfig(wid);
  const baseDmg = isSniper
    ? _getSniperBodyDamage(enemy.waveConfig, enemy.waveIndex)
    : playerState.isADS
      ? cfg.adsDamage
      : cfg.hipDamage;
  const dmg = isHeadshot ? (isSniper ? 9999 : baseDmg * 2.5) : baseDmg;

  _applyDamage(
    enemy,
    Math.round(dmg),
    isHeadshot,
    hud,
    addScoreFn,
    waveConfig,
    onKill,
    scene,
    camera,
    enemies,
    allHits,
  );
}

/* ── Shotgun: 6 pellets with spread ───────────────────────── */
function _fireShotgun(
  scene,
  camera,
  enemies,
  hud,
  addScoreFn,
  waveConfig,
  onKill,
) {
  const cfg = getWeaponConfig(WEAPON_SHOTGUN);
  const PELLETS = cfg.pellets;
  const SPREAD = playerState.isADS ? (cfg.adsSpread ?? cfg.spread) : cfg.spread;

  playSound("shotgun-fire", "shotgun");
  playSound("gun-shell-drop", "shellDrop", 0.6);

  const baseDmg = playerState.isADS ? cfg.adsDamage : cfg.hipDamage;

  // Build mesh-to-enemy map for ALL enemies (skeleton + procedural)
  const meshToEnemy = new Map();
  const allMeshes = [];
  for (const enemy of enemies) {
    if (enemy.isDead || !enemy.root) continue;
    enemy.root.traverse((obj) => {
      if (obj.isMesh) {
        meshToEnemy.set(obj, enemy);
        allMeshes.push(obj);
      }
    });
  }

  let hitAny = false;

  for (let i = 0; i < PELLETS; i++) {
    const _rayOrigin = new THREE.Vector3();
    const _rayDir = new THREE.Vector3();
    camera.getWorldPosition(_rayOrigin);
    camera.getWorldDirection(_rayDir);

    _rayDir.x += (Math.random() - 0.5) * SPREAD;
    _rayDir.y += (Math.random() - 0.5) * SPREAD;
    _rayDir.z += (Math.random() - 0.5) * SPREAD * 0.5;
    _rayDir.normalize();

    const _shotRay = new THREE.Ray(_rayOrigin, _rayDir);

    let boneHitEnemy = null;
    let boneHitZone = null;
    let boneHitDist = Infinity;
    for (const enemy of enemies) {
      if (enemy.isDead || !enemy.root || !enemy.skeleton) continue;
      const result = enemy.checkRayHit(_shotRay);
      if (result && result.dist < boneHitDist) {
        boneHitDist = result.dist;
        boneHitEnemy = enemy;
        boneHitZone = result.zone;
      }
    }

    if (!boneHitEnemy) {
      // Fallback: raycast against all enemy meshes (both skeleton + procedural)
      _raycaster.set(_rayOrigin, _rayDir);
      const meshHits = allMeshes.length
        ? _raycaster.intersectObjects(allMeshes, false)
        : [];
      if (!meshHits.length) continue;
      const enemy = meshToEnemy.get(meshHits[0].object);
      if (!enemy) continue;
      hitAny = true;
      const dmg = Math.round(baseDmg);
      _applyDamage(
        enemy,
        dmg,
        false,
        hud,
        addScoreFn,
        waveConfig,
        onKill,
        scene,
        camera,
        enemies,
        [meshHits[0]],
      );
    } else {
      hitAny = true;
      const isHeadshot = boneHitZone === "head";
      const dmg = isHeadshot ? Math.round(baseDmg * 2.5) : Math.round(baseDmg);
      _applyDamage(
        boneHitEnemy,
        dmg,
        isHeadshot,
        hud,
        addScoreFn,
        waveConfig,
        onKill,
        scene,
        camera,
        enemies,
        [],
      );
    }
  }

  if (!hitAny) {
    _handleMiss(scene, camera, enemies, waveConfig);
  }
}

/* ── Rocket launcher: projectile + AOE ────────────────────── */
function _fireMac10(
  scene,
  camera,
  enemies,
  hud,
  addScoreFn,
  waveConfig,
  onKill,
) {
  const cfg = getWeaponConfig(WEAPON_MAC10);
  const { burstCount, burstDelay, spread } = getMac10BurstSettings(
    cfg,
    playerState,
  );

  const baseDmg = playerState.isADS ? cfg.adsDamage : cfg.hipDamage;
  const meshToEnemy = new Map();
  const allMeshes = [];
  for (const enemy of enemies) {
    if (enemy.isDead || !enemy.root) continue;
    enemy.root.traverse((obj) => {
      if (obj.isMesh) {
        meshToEnemy.set(obj, enemy);
        allMeshes.push(obj);
      }
    });
  }

  let hitAny = false;
  let shotIndex = 0;
  let burstScoreApplied = false;
  let burstHitThisBurst = false;

  const fireOneShot = () => {
    if (shotIndex >= burstCount) return;

    if (!consumeAmmo()) {
      playSound("empty-gun", "emptyGun");
      hud?.showPopup?.("NO AMMO", "warn");
      return;
    }

    const _rayOrigin = new THREE.Vector3();
    const _rayDir = new THREE.Vector3();
    camera.getWorldPosition(_rayOrigin);
    camera.getWorldDirection(_rayDir);

    _rayDir.x += (Math.random() - 0.5) * spread;
    _rayDir.y += (Math.random() - 0.5) * spread * 0.35;
    _rayDir.z += (Math.random() - 0.5) * spread * 0.5;
    _rayDir.normalize();

    const _shotRay = new THREE.Ray(_rayOrigin, _rayDir);

    let boneHitEnemy = null;
    let boneHitZone = null;
    let boneHitDist = Infinity;
    for (const enemy of enemies) {
      if (enemy.isDead || !enemy.root || !enemy.skeleton) continue;
      const result = enemy.checkRayHit(_shotRay);
      if (result && result.dist < boneHitDist) {
        boneHitDist = result.dist;
        boneHitEnemy = enemy;
        boneHitZone = result.zone;
      }
    }

    let hitThisShot = false;
    if (!boneHitEnemy) {
      _raycaster.set(_rayOrigin, _rayDir);
      const meshHits = allMeshes.length
        ? _raycaster.intersectObjects(allMeshes, false)
        : [];
      if (meshHits.length) {
        const enemy = meshToEnemy.get(meshHits[0].object);
        if (enemy) {
          hitAny = true;
          hitThisShot = true;
          burstHitThisBurst = true;
          const dmg = Math.round(baseDmg);
          const grantScore = shouldApplyBurstScore(
            shotIndex,
            burstCount,
            burstHitThisBurst,
            burstScoreApplied,
          );
          if (grantScore) burstScoreApplied = true;
          _applyDamage(
            enemy,
            dmg,
            false,
            hud,
            addScoreFn,
            waveConfig,
            onKill,
            scene,
            camera,
            enemies,
            [meshHits[0]],
            grantScore,
          );
        }
      }
    } else {
      hitAny = true;
      hitThisShot = true;
      burstHitThisBurst = true;
      const isHeadshot = boneHitZone === "head";
      const dmg = isHeadshot ? Math.round(baseDmg * 1.6) : Math.round(baseDmg);
      const grantScore = shouldApplyBurstScore(
        shotIndex,
        burstCount,
        burstHitThisBurst,
        burstScoreApplied,
      );
      if (grantScore) burstScoreApplied = true;
      _applyDamage(
        boneHitEnemy,
        dmg,
        isHeadshot,
        hud,
        addScoreFn,
        waveConfig,
        onKill,
        scene,
        camera,
        enemies,
        [],
        grantScore,
      );
    }

    if (!hitThisShot) {
      burstHitThisBurst = false;
    }

    shotIndex += 1;
    applyRecoil(0.004);
    _spawnMuzzleFlash(scene, camera);

    if (shotIndex < burstCount) {
      setTimeout(fireOneShot, burstDelay * 1000);
    } else if (!hitAny) {
      _handleMiss(scene, camera, enemies, waveConfig);
    }
  };

  playSound("mac10-fire", "mac10");
  playSound("gun-shell-drop", "shellDrop", 0.6);
  fireOneShot();
}

function _fireRocket(
  scene,
  camera,
  enemies,
  hud,
  addScoreFn,
  waveConfig,
  onKill,
  onRocketExplode,
) {
  playSound("rocket-shot", "rocket");
  playSound("rpg-bullet-move", "rocket");
  const cfg = getWeaponConfig(WEAPON_ROCKET);

  const origin = new THREE.Vector3();
  const dir = new THREE.Vector3();
  camera.getWorldPosition(origin);
  camera.getWorldDirection(dir);

  const SPEED = 60;
  const RADIUS = cfg.explosionRadius;

  const rocket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 0.25, 6),
    new THREE.MeshBasicMaterial({ color: 0xff4422 }),
  );
  rocket.rotation.x = Math.PI / 2;
  rocket.position.copy(origin).addScaledVector(dir, 0.3);
  scene.add(rocket);

  const light = new THREE.PointLight(0xff4400, 4, 8);
  rocket.add(light);

  const vel = dir.clone().multiplyScalar(SPEED);
  let prevPos = rocket.position.clone();
  const startPos = rocket.position.clone();

  // Build a flat list of world meshes once (excludes enemy roots, FX
  // objects, invisible nodes, and camera children) — reused each step tick
  // instead of recursing scene.children every frame.
  const _enemyRoots = new Set(enemies.map((e) => e.root).filter(Boolean));
  function _buildWorldMeshList() {
    const out = [];
    scene.traverse((obj) => {
      if (!obj.isMesh) return;
      if (!obj.visible) return;
      if (obj === rocket || obj === light) return;
      // Walk up to check camera-child or enemy-root ancestry
      let cur = obj;
      while (cur.parent) {
        if (cur.parent === camera) return;
        if (_enemyRoots.has(cur.parent)) return;
        cur = cur.parent;
      }
      out.push(obj);
    });
    return out;
  }
  let _worldMeshCache = null;

  function step() {
    rocket.position.addScaledVector(vel, 0.016);
    const p = rocket.position;

    // Swept-sphere collision: ray between previous frame pos and current pos
    const delta = new THREE.Vector3().copy(p).sub(prevPos);
    const segLen = delta.length();
    if (segLen > 0) {
      const segDir = delta.clone().normalize();
      _raycaster.set(prevPos, segDir);
      _raycaster.far = segLen + 0.5;

      // Check enemy hit — ray against each enemy's meshes
      for (const enemy of enemies) {
        if (enemy.isDead || !enemy.root) continue;
        const meshes = [];
        enemy.root.traverse((child) => {
          if (child.isMesh) meshes.push(child);
        });
        if (meshes.length === 0) continue;
        const hits = _raycaster.intersectObjects(meshes, false);
        if (hits.length > 0 && hits[0].distance <= segLen) {
          _detonateRocket(
            scene,
            rocket,
            hits[0].point,
            RADIUS,
            cfg.hipDamage,
            enemies,
            hud,
            addScoreFn,
            waveConfig,
            onKill,
            onRocketExplode,
          );
          return;
        }
      }

      // Check world collision (environment) — use pre-filtered mesh list
      // to avoid a full scene.children recursive walk every frame.
      if (!_worldMeshCache) _worldMeshCache = _buildWorldMeshList();
      const worldHits = _raycaster.intersectObjects(_worldMeshCache, false);
      for (const wh of worldHits) {
        if (wh.distance < 0.3) continue;
        if (wh.distance > 0 && wh.distance <= segLen) {
          _detonateRocket(
            scene,
            rocket,
            wh.point,
            RADIUS,
            cfg.hipDamage,
            enemies,
            hud,
            addScoreFn,
            waveConfig,
            onKill,
            onRocketExplode,
          );
          return;
        }
      }
    }

    // Hit ground
    if (p.y < 0) {
      p.y = 0;
      _detonateRocket(
        scene,
        rocket,
        p,
        RADIUS,
        cfg.hipDamage,
        enemies,
        hud,
        addScoreFn,
        waveConfig,
        onKill,
        onRocketExplode,
      );
      return;
    }

    prevPos.copy(p);

    // Safety despawn — distance traveled from spawn point, not world origin
    if (startPos.distanceTo(p) > 200) {
      scene.remove(rocket);
      return;
    }

    requestAnimationFrame(step);
  }
  step();
}

function _detonateRocket(
  scene,
  rocket,
  pos,
  radius,
  damage,
  enemies,
  hud,
  addScoreFn,
  waveConfig,
  onKill,
  onRocketExplode,
) {
  scene.remove(rocket);
  if (typeof onRocketExplode === "function") {
    onRocketExplode(pos, radius, damage);
  }
  _spawnExplosionFX(scene, pos);
  _rocketShake();
}

function _rocketShake() {
  // Simple camera shake via CSS transform on body
  const el = document.body;
  el.style.transition = "transform 0.08s";
  el.style.transform = "translate(3px, 2px)";
  setTimeout(() => {
    el.style.transform = "translate(-2px, 1px)";
  }, 50);
  setTimeout(() => {
    el.style.transform = "";
  }, 100);
}

function _spawnExplosionFX(scene, pos, radius = 6) {
  playSound("granade-explosion", "grenadeExplosion");

  const center = pos.clone();
  center.y = Math.max(center.y, 0.08);

  // Flash light — brief bright pulse that fades out
  const flash = new THREE.PointLight(0xff6600, 22, radius * 3.2);
  flash.position.copy(center);
  scene.add(flash);

  // Fireball — starts small, punches outward, fades. Scaled off the
  // real explosion radius so bigger blasts visibly look bigger.
  const ballBaseRadius = Math.max(0.4, radius * 0.32);
  const ballGeo = new THREE.IcosahedronGeometry(ballBaseRadius, 1);
  const ballMat = new THREE.MeshBasicMaterial({
    color: 0xff5500,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  const ball = new THREE.Mesh(ballGeo, ballMat);
  ball.position.copy(center);
  ball.raycast = () => {}; // never block subsequent aim/hit raycasts
  scene.add(ball);

  // Inner hot core for extra punch
  const coreGeo = new THREE.SphereGeometry(ballBaseRadius * 0.5, 8, 8);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xffdd88,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.copy(center);
  core.raycast = () => {};
  scene.add(core);

  // Ground shockwave ring — expands out to (roughly) the real blast radius
  const ringGeo = new THREE.RingGeometry(radius * 0.08, radius * 0.24, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xff8844,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(center.x, 0.06, center.z);
  ring.raycast = () => {};
  scene.add(ring);

  const start = performance.now();
  const duration = 650;

  // Smoke puffs — deferred one frame so their geometry allocation does
  // NOT stall the detonation render frame (the biggest freeze culprit).
  const smokeCount = 5;
  const smokes = [];
  let smokesReady = false;

  requestAnimationFrame(() => {
    for (let i = 0; i < smokeCount; i++) {
      const sGeo = new THREE.SphereGeometry(
        ballBaseRadius * (0.5 + Math.random() * 0.3),
        6,
        6,
      );
      const sMat = new THREE.MeshBasicMaterial({
        color: 0x555550,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      });
      const smoke = new THREE.Mesh(sGeo, sMat);
      const ang = (i / smokeCount) * Math.PI * 2;
      smoke.position.set(
        center.x + Math.cos(ang) * ballBaseRadius * 0.4,
        center.y,
        center.z + Math.sin(ang) * ballBaseRadius * 0.4,
      );
      smoke.raycast = () => {};
      scene.add(smoke);
      smokes.push({
        mesh: smoke,
        geo: sGeo,
        mat: sMat,
        dir: new THREE.Vector3(Math.cos(ang), 1, Math.sin(ang)),
      });
    }
    smokesReady = true;
  });

  const animFX = (now) => {
    const p = Math.min((now - start) / duration, 1);

    // Fireball: fast expand, fade after mid-point
    const ballScale = 1 + p * (radius / ballBaseRadius - 1) * 0.9;
    ball.scale.setScalar(ballScale);
    ball.rotation.y = p * 2.2;
    ballMat.opacity = 0.85 * (1 - Math.max(0, (p - 0.35) / 0.65));

    core.scale.setScalar(1 + p * 3.5);
    coreMat.opacity = 0.95 * (1 - p / 0.5 > 0 ? 1 - p / 0.5 : 0);

    flash.intensity = 22 * (1 - p);

    // Shockwave ring: expands out to the true blast radius, then fades
    const ringScale = 1 + p * (radius / (radius * 0.24) - 1);
    ring.scale.setScalar(ringScale);
    ringMat.opacity = 0.6 * (1 - p);

    // Smoke: drift outward/upward, fade slowly (only once ready)
    if (smokesReady) {
      for (const s of smokes) {
        s.mesh.position.addScaledVector(s.dir, 0.02);
        s.mat.opacity = 0.5 * (1 - p);
        s.mesh.scale.setScalar(1 + p * 1.6);
      }
    }

    if (p < 1) {
      requestAnimationFrame(animFX);
    } else {
      scene.remove(flash, ball, core, ring);
      ballGeo.dispose();
      ballMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      for (const s of smokes) {
        scene.remove(s.mesh);
        s.geo.dispose();
        s.mat.dispose();
      }
    }
  };
  requestAnimationFrame(animFX);
}

/* ── Rocket aim indicator (trajectory + accurate blast-radius preview) ──
   Shown only while the player is ADS with the rocket launcher equipped.
   The rocket flies in a dead-straight line (no gravity — see _fireRocket
   above), so the predicted impact point is just a raycast, and the ring
   radius is drawn directly from the SAME cfg.explosionRadius / horizontal-
   distance check that the real damage handler (_rocketExplodeHandler in
   main.js) uses — so what you see lined up before firing is exactly what
   gets hit after firing. ───────────────────────────────────────────── */
const ROCKET_AIM_RANGE = 120;
const _aimRaycaster = new THREE.Raycaster();

const _rocketAim = {
  line: null,
  ring: null,
  disc: null,
  suppressUntil: 0,
};

let _rocketBlastCounterEl = null;

// Cache for the flat world-mesh list used by updateRocketAim — rebuilt
// at most once every 500 ms so scene.traverse doesn't run every ADS frame.
let _aimWorldMeshCache = null;
let _aimWorldMeshCacheTime = 0;
const _AIM_MESH_CACHE_TTL = 500; // ms

function _ensureRocketAimObjects(scene) {
  if (_rocketAim.line) return;

  const lineMat = new THREE.LineBasicMaterial({
    color: 0xffaa33,
    transparent: true,
    opacity: 0.85,
    depthTest: false,
  });
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(),
    new THREE.Vector3(),
  ]);
  _rocketAim.line = new THREE.Line(lineGeo, lineMat);
  _rocketAim.line.renderOrder = 998;
  _rocketAim.line.frustumCulled = false;
  _rocketAim.line.raycast = () => {};
  _rocketAim.line.visible = false;
  scene.add(_rocketAim.line);

  // Ring + disc are built as unit circles (radius 1) and scaled per-frame
  // to the weapon's real explosion radius — no guessing, no drift.
  const ringGeo = new THREE.RingGeometry(0.93, 1, 48);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xffaa33,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false,
  });
  _rocketAim.ring = new THREE.Mesh(ringGeo, ringMat);
  _rocketAim.ring.rotation.x = -Math.PI / 2;
  _rocketAim.ring.renderOrder = 998;
  _rocketAim.ring.frustumCulled = false;
  _rocketAim.ring.raycast = () => {};
  _rocketAim.ring.visible = false;
  scene.add(_rocketAim.ring);

  const discGeo = new THREE.CircleGeometry(1, 48);
  const discMat = new THREE.MeshBasicMaterial({
    color: 0xffaa33,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false,
  });
  _rocketAim.disc = new THREE.Mesh(discGeo, discMat);
  _rocketAim.disc.rotation.x = -Math.PI / 2;
  _rocketAim.disc.renderOrder = 997;
  _rocketAim.disc.frustumCulled = false;
  _rocketAim.disc.raycast = () => {};
  _rocketAim.disc.visible = false;
  scene.add(_rocketAim.disc);
}

function _ensureRocketBlastCounterEl() {
  if (_rocketBlastCounterEl) return;
  _rocketBlastCounterEl = document.createElement("div");
  _rocketBlastCounterEl.id = "rocket-blast-counter";
  _rocketBlastCounterEl.style.cssText = [
    "position:fixed",
    "left:50%",
    "top:calc(50% + 44px)",
    "transform:translateX(-50%)",
    "padding:4px 14px",
    "border-radius:6px",
    "font-family:'Luckiest Guy','Baloo 2','Impact','Arial Black',sans-serif",
    "font-size:14px",
    "letter-spacing:1px",
    "text-transform:uppercase",
    "color:#fff",
    "text-shadow:0 1px 2px rgba(0,0,0,0.7)",
    "background:rgba(0,0,0,0.35)",
    "pointer-events:none",
    "z-index:60",
    "display:none",
    "white-space:nowrap",
  ].join(";");
  document.body.appendChild(_rocketBlastCounterEl);
}

// function _showRocketBlastCounter(count) {
//   _ensureRocketBlastCounterEl();
//   _rocketBlastCounterEl.style.display = "block";
//   if (count > 0) {
//     _rocketBlastCounterEl.textContent =
//       count === 1 ? "1 ENEMY IN BLAST RADIUS" : `${count} ENEMIES IN BLAST RADIUS`;
//     _rocketBlastCounterEl.style.background = "rgba(150,0,0,0.55)";
//   } else {
//     _rocketBlastCounterEl.textContent = "NO TARGETS IN RANGE";
//     _rocketBlastCounterEl.style.background = "rgba(0,0,0,0.35)";
//   }
// }

function _hideRocketBlastCounter() {
  if (_rocketBlastCounterEl) _rocketBlastCounterEl.style.display = "none";
}

/**
 * Call every frame while the player is ADS with the rocket launcher
 * equipped. Draws the flight-path line and an accurate blast-radius
 * ring/disc at the predicted impact point, and shows a live count of
 * how many enemies are actually inside that radius.
 */
export function updateRocketAim(scene, camera, enemies) {
  _ensureRocketAimObjects(scene);

  const now = performance.now();
  if (now < _rocketAim.suppressUntil) {
    clearRocketAim();
    return;
  }

  const cfg = getWeaponConfig(WEAPON_ROCKET);
  const RADIUS = cfg.explosionRadius ?? 6;

  const origin = new THREE.Vector3();
  const dir = new THREE.Vector3();
  camera.getWorldPosition(origin);
  camera.getWorldDirection(dir);
  dir.normalize();

  // Start the probe ahead of the hands/gun model — mirrors where the real
  // rocket begins its first collision checks in _fireRocket, so this
  // preview never self-intersects the viewmodel.
  const probeStart = origin.clone().addScaledVector(dir, 1.3);

  // 1) Closest enemy within the rocket's hit radius (1.0m) of the flight
  //    path — same threshold the real in-flight check uses.
  let bestEnemy = null;
  let bestEnemyT = Infinity;
  for (const enemy of enemies) {
    if (enemy.isDead || !enemy.root) continue;
    const toEnemy = enemy.root.position.clone().sub(probeStart);
    const t = toEnemy.dot(dir);
    if (t < 0 || t > ROCKET_AIM_RANGE) continue;
    const closest = probeStart.clone().addScaledVector(dir, t);
    const perp = closest.distanceTo(enemy.root.position);
    if (perp < 1.0 && t < bestEnemyT) {
      bestEnemyT = t;
      bestEnemy = enemy;
    }
  }

  // 2) Nearest environment surface along the same ray.
  //    Use a TTL-cached flat mesh list (rebuilt max once per 500 ms) so
  //    scene.traverse does NOT run on every ADS render frame — the chief
  //    cause of the scoped-in freeze.
  if (!_aimWorldMeshCache || now - _aimWorldMeshCacheTime > _AIM_MESH_CACHE_TTL) {
    const aimEnemyRoots = new Set(enemies.map((e) => e.root).filter(Boolean));
    _aimWorldMeshCache = [];
    scene.traverse((obj) => {
      if (!obj.isMesh || !obj.visible) return;
      let cur = obj;
      while (cur.parent) {
        if (aimEnemyRoots.has(cur.parent) || aimEnemyRoots.has(cur)) return;
        cur = cur.parent;
      }
      _aimWorldMeshCache.push(obj);
    });
    _aimWorldMeshCacheTime = now;
  }
  _aimRaycaster.set(probeStart, dir);
  _aimRaycaster.far = ROCKET_AIM_RANGE;
  const envHits = _aimRaycaster.intersectObjects(_aimWorldMeshCache, false);
  const envDist = envHits.length ? envHits[0].distance : Infinity;

  let impact = null;
  if (bestEnemy && bestEnemyT <= envDist) {
    impact = bestEnemy.root.position.clone();
  } else if (envHits.length) {
    impact = envHits[0].point.clone();
  }

  if (!impact) {
    clearRocketAim();
    return;
  }

  // ── Trajectory line: muzzle → predicted impact point ──
  const muzzle = origin.clone().addScaledVector(dir, 0.3);
  const posAttr = _rocketAim.line.geometry.attributes.position;
  posAttr.setXYZ(0, muzzle.x, muzzle.y, muzzle.z);
  posAttr.setXYZ(1, impact.x, impact.y, impact.z);
  posAttr.needsUpdate = true;
  _rocketAim.line.geometry.computeBoundingSphere();
  _rocketAim.line.visible = true;

  // ── Blast radius ring/disc — scaled directly to cfg.explosionRadius,
  //    the exact same value used for real damage, laid flat on the
  //    ground at the impact point. ──
  // const groundY = impact.y + 0.06;
  // _rocketAim.ring.position.set(impact.x, groundY, impact.z);
  // _rocketAim.ring.scale.setScalar(RADIUS);
  // _rocketAim.disc.position.set(impact.x, groundY - 0.01, impact.z);
  // _rocketAim.disc.scale.setScalar(RADIUS);
  // _rocketAim.ring.visible = true;
  // _rocketAim.disc.visible = true;

  // ── Count enemies actually inside that radius — identical math to
  //    _rocketExplodeHandler's horizontal-distance check in main.js, so
  //    the preview can never disagree with what happens on fire. ──
  let hitCount = 0;
  for (const enemy of enemies) {
    if (enemy.isDead || !enemy.root) continue;
    const dx = enemy.root.position.x - impact.x;
    const dz = enemy.root.position.z - impact.z;
    if (Math.sqrt(dx * dx + dz * dz) < RADIUS) hitCount++;
  }

  const pulse = 0.5 + Math.sin(now / 140) * 0.5;
  if (hitCount > 0) {
    _rocketAim.ring.material.color.setHex(0xff2b2b);
    _rocketAim.disc.material.color.setHex(0xff2b2b);
    _rocketAim.ring.material.opacity = 0.55 + pulse * 0.25;
    _rocketAim.disc.material.opacity = 0.16 + pulse * 0.08;
    _rocketAim.line.material.color.setHex(0xff3b3b);
  } else {
    _rocketAim.ring.material.color.setHex(0xffaa33);
    _rocketAim.disc.material.color.setHex(0xffaa33);
    _rocketAim.ring.material.opacity = 0.5;
    _rocketAim.disc.material.opacity = 0.12;
    _rocketAim.line.material.color.setHex(0xffaa33);
  }

  // _showRocketBlastCounter(hitCount);
}

/** Hide the rocket trajectory/blast-radius preview (weapon switched, ADS released, etc). */
export function clearRocketAim() {
  if (_rocketAim.line) _rocketAim.line.visible = false;
  if (_rocketAim.ring) _rocketAim.ring.visible = false;
  if (_rocketAim.disc) _rocketAim.disc.visible = false;
  _hideRocketBlastCounter();
}

/* ── Shared helpers ───────────────────────────────────────── */
function _handleMiss(scene, camera, enemies, waveConfig) {
  const shooterPos = new THREE.Vector3();
  camera.getWorldPosition(shooterPos);

  let target = null;
  let minDist = Infinity;
  for (const e of enemies) {
    if (e.isDead || !e.root) continue;
    if (!e.alerted) continue;
    const d = e.root.position.distanceTo(shooterPos);
    if (d < minDist) {
      minDist = d;
      target = e;
    }
  }
  if (!target) {
    minDist = Infinity;
    for (const e of enemies) {
      if (e.isDead || !e.root) continue;
      const d = e.root.position.distanceTo(shooterPos);
      if (d < minDist) {
        minDist = d;
        target = e;
      }
    }
  }
  if (target) {
    target.alert();
    setTimeout(() => {
      if (!target.isDead) target.gun?.firePenaltyShot?.();
    }, 500);
  }
  _alertNearbyEnemies(enemies, shooterPos, waveConfig);
  _spawnDecal(scene, camera);
}

let _mac10BurstPending = false;

function _applyDamage(
  enemy,
  dmg,
  isHeadshot,
  hud,
  addScoreFn,
  waveConfig,
  onKill,
  scene,
  camera,
  enemies,
  allHits,
  grantScore = true,
) {
  const killed = enemy.takeDamage(dmg, isHeadshot);
  hud?.showHitMarker?.(isHeadshot);

  if (grantScore) {
    const baseScore = isHeadshot ? 150 : 80;
    const gained = Math.round(baseScore * playerState.combo);
    playerState.score += gained;
    playerState.combo = Math.min(playerState.combo + 0.25, 8);
    playerState.comboTimer = 3.0;
    hud?.setScore?.(playerState.score);

    if (typeof addScoreFn === "function") addScoreFn(gained, isHeadshot);
  }
  if (killed) {
    playerState.kills = (playerState.kills ?? 0) + 1;
    if (
      playerState.weaponKills &&
      typeof playerState.activeWeapon === "number"
    ) {
      playerState.weaponKills[playerState.activeWeapon] =
        (playerState.weaponKills[playerState.activeWeapon] || 0) + 1;
    }
    hud?.showPopup?.(`+${gained}`, isHeadshot ? "headshot" : "kill");
    hud?.showKillTypePopup?.(isHeadshot);
    if (onKill && typeof enemy.waveIndex === "number") {
      onKill(enemy.waveIndex);
    }
  }

  if (!killed) enemy.alert();

  const shooterPos = new THREE.Vector3();
  camera.getWorldPosition(shooterPos);
  _alertNearbyEnemies(enemies, shooterPos, waveConfig);

  const sparkHit = allHits?.[0];
  if (sparkHit) _spawnImpactSpark(scene, sparkHit.point);
}

function _getSniperBodyDamage(waveConfig, waveIndex = 0) {
  const enemyHp = Math.max(1, waveConfig?.hp ?? 50);
  const twoShotDamage = Math.ceil(enemyHp / 2);
  const wave = Math.max(0, waveIndex);
  const scaledDamage = Math.round(150 - wave * 9);

  return Math.max(twoShotDamage, scaledDamage);
}

function _alertNearbyEnemies(enemies, shooterPos, waveConfig) {
  const count = waveConfig?.gunfireAlertCount ?? 2;
  const radius = waveConfig?.gunfireAlertRadius ?? 50;

  const candidates = enemies.filter((e) => !e.isDead && !e.alerted && e.root);
  candidates.sort((a, b) => {
    const distA = a.root.position.distanceTo(shooterPos);
    const distB = b.root.position.distanceTo(shooterPos);
    return distA - distB;
  });

  let alertedCount = 0;
  for (const enemy of candidates) {
    if (alertedCount >= count) break;
    const dist = enemy.root.position.distanceTo(shooterPos);
    if (dist <= radius) {
      // Delay proportional to distance — farther enemies react slower
      const delay = (dist / radius) * 400;
      setTimeout(() => enemy.alert?.(), delay);
      alertedCount++;
    }
  }
}

/* ── Muzzle flash (reusable, pre-warmed) ─────────────────── */
const _flashMat = new THREE.MeshBasicMaterial({
  color: 0xffdd44,
  transparent: true,
  opacity: 0.85,
  depthWrite: false,
});

let _muzzleFlashMesh = null;
let _muzzleFlashLight = null;
let _muzzleFlashTimer = null;

/**
 * Call once after camera is created to pre-warm GPU shaders
 * so the first shot doesn't hitch.
 */
export function prewarmMuzzleFlash(camera) {
  if (_muzzleFlashMesh) return; // already created
  _muzzleFlashMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 6, 6),
    _flashMat,
  );
  _muzzleFlashMesh.renderOrder = 2;
  _muzzleFlashMesh.visible = false;

  _muzzleFlashLight = new THREE.PointLight(0xffcc55, 0, 3.5);
  _muzzleFlashLight.visible = true; // Always visible with 0 intensity so shader lights count stays constant

  camera.add(_muzzleFlashMesh);
  camera.add(_muzzleFlashLight);
}

function _spawnMuzzleFlash(scene, camera) {
  if (!_muzzleFlashMesh) {
    prewarmMuzzleFlash(camera);
  } else if (_muzzleFlashMesh.parent !== camera) {
    camera.add(_muzzleFlashMesh);
    camera.add(_muzzleFlashLight);
  }

  const cfg = getWeaponConfig(playerState.activeWeapon);
  _muzzleFlashMesh.position.set(
    cfg.muzzleFlashPos[0],
    cfg.muzzleFlashPos[1],
    cfg.muzzleFlashPos[2],
  );
  _muzzleFlashLight.position.set(
    cfg.muzzleFlashPos[0],
    cfg.muzzleFlashPos[1],
    cfg.muzzleFlashPos[2],
  );

  _muzzleFlashMesh.visible = true;
  _muzzleFlashLight.intensity = 8;

  if (_muzzleFlashTimer) clearTimeout(_muzzleFlashTimer);
  _muzzleFlashTimer = setTimeout(() => {
    _muzzleFlashMesh.visible = false;
    _muzzleFlashLight.intensity = 0;
    _muzzleFlashTimer = null;
  }, 55);
}

/* ── Impact spark (reusable) ─────────────────────────────── */
const _sparkMat = new THREE.MeshBasicMaterial({
  color: 0xff6622,
});

let _sparkMesh = null;
let _sparkTimer = null;

function _spawnImpactSpark(scene, pos) {
  if (!_sparkMesh) {
    _sparkMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 4, 4),
      _sparkMat,
    );
  }
  _sparkMesh.position.copy(pos);
  scene.add(_sparkMesh);

  if (_sparkTimer) clearTimeout(_sparkTimer);
  _sparkTimer = setTimeout(() => {
    scene.remove(_sparkMesh);
    _sparkTimer = null;
  }, 80);
}

/* ── Bullet decal (env, uses pool) ────────────────────────── */

function _spawnDecal(scene, camera) {
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  const origin = new THREE.Vector3();
  camera.getWorldPosition(origin);

  _raycaster.set(origin, dir);
  const envHits = _raycaster.intersectObjects(scene.children, true);
  if (!envHits.length) return;
  const h = envHits[0];
  const d = getFromPool("bulletDecal");
  if (!d) return;
  d.position.copy(h.point).addScaledVector(h.face.normal, 0.002);
  d.lookAt(h.point.clone().add(h.face.normal));
  d.visible = true;
  setTimeout(() => {
    d.visible = false;
    releaseToPool("bulletDecal", d);
  }, 8000);
}
