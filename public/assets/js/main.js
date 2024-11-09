let scene, camera, renderer, model, mixer, group;
let mouseX = 0, mouseY = 0;
let progress = 0;
let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

function init() {
  scene = new THREE.Scene();

  // Создаем загрузчик с использованием менеджера загрузки
  const loadingManager = new THREE.LoadingManager();

  loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    progress = (itemsLoaded / itemsTotal) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
  };

  loadingManager.onLoad = function () {
    document.querySelector('.preloader').style.display = 'none';
    animate();
  };

  loadingManager.onError = function (url) {
    console.error(`Ошибка загрузки: ${url}`);
  };

  const textureLoader = new THREE.TextureLoader(loadingManager);
  textureLoader.load('/assets/models/SUB_Math_01_0.jpg', (texture) => {
    scene.background = texture;
  });

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 1;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 5);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  scene.add(directionalLight);

  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.ShadowMaterial({ opacity: 0.3 })
  );
  wall.rotation.x = -Math.PI / 2;
  wall.position.y = -0.8;
  wall.receiveShadow = true;
  scene.add(wall);

  const overlay = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.5, transparent: true })
  );
  overlay.position.z = -10;
  scene.add(overlay);

  const loader = new THREE.GLTFLoader(loadingManager);
  loader.load('/assets/models/scene (5).glb', (gltf) => {
    model = gltf.scene;
    model.position.set(0, -1.3, 0);
    model.scale.set(1, 1, 1);
    model.castShadow = true;
    scene.add(model);

    model.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.material = new THREE.MeshStandardMaterial({
          map: object.material.map,
          normalMap: object.material.normalMap,
          roughness: 0.4,
          metalness: 0.5,
          emissive: 0x111111,
          emissiveIntensity: 0.1
        });
      }
      if (object.name === 'Group') {
        group = object;
        group.position.set(0, -10.0, 0);
      }
    });

    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });
  }, undefined, (error) => {
    console.error('Ошибка при загрузке модели:', error);
  });

  window.addEventListener('resize', onWindowResize);

  if (isTouchDevice) {
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
  } else {
    window.addEventListener('mousemove', onMouseMove);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
  mouseX = ((event.clientX - 60) / window.innerWidth) * 2 - 1;
  mouseY = ((event.clientY / window.innerHeight) * 2 - 1);
}

function onTouchStart(event) {
  if (event.touches.length === 1) {
    event.preventDefault();
    mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.touches[0].clientY / window.innerHeight) * 2 - 1;
  }
}

function onTouchMove(event) {
  if (event.touches.length === 1) {
    event.preventDefault();
    mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.touches[0].clientY / window.innerHeight) * 2 - 1;
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (mixer) mixer.update(0.01);

  if (group) {
    const rotationSpeed = 0.1;
    group.rotation.x += (mouseY * 0.1 - group.rotation.x) * rotationSpeed;
    group.rotation.x = Math.max(Math.min(group.rotation.x, Math.PI / 2), -Math.PI / 2);
    group.rotation.y += (mouseX * 0.2 - group.rotation.y) * rotationSpeed;
    group.rotation.y = Math.max(Math.min(group.rotation.y, Math.PI), -Math.PI);
  }

  renderer.render(scene, camera);
}

// Инициализируем приложение
init();
