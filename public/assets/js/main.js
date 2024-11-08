let scene, camera, renderer, model, mixer, group;
let mouseX = 0, mouseY = 0;
let progress = 0;

function init() {
  scene = new THREE.Scene();

  // Create a loading manager to track loading progress
  const loadingManager = new THREE.LoadingManager();
  loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log('Started loading', url, itemsLoaded, itemsTotal);
  };
  loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    // Update progress bar based on loaded assets
    progress = (itemsLoaded / itemsTotal) * 100;
    document.getElementById('progress-bar').style.width = progress + '%';
  };
  loadingManager.onLoad = function () {
    // Once everything is loaded, hide the preloader
    document.querySelector('.preloader').style.display = 'none';
    console.log('All assets loaded!');
  };
  loadingManager.onError = function (url) {
    console.error('Error loading', url);
  };

  // Загрузка изображения фона
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

  // Добавление освещения
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 5);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xFFFFFF, 1.5, 10);
  pointLight.position.set(0, 1, 2);
  scene.add(pointLight);

  // Подложка для теней
  const wallGeometry = new THREE.PlaneGeometry(100, 100);
  const wallMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.rotation.x = -Math.PI / 2;
  wall.position.y = -0.8;
  wall.receiveShadow = true;
  scene.add(wall);

  // Добавление полупрозрачной плоскости для затемнения
  const overlayGeometry = new THREE.PlaneGeometry(100, 100);
  const overlayMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.8, transparent: true });
  const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
  overlay.position.z = -10;  // Помещаем позади модели
  scene.add(overlay);

  // Загрузка 3D-модели с использованием loadingManager
  const loader = new THREE.GLTFLoader(loadingManager);
  loader.load('/assets/models/scene (5).glb', (gltf) => {
    model = gltf.scene;
    model.position.set(0, -1.3, 0);
    model.scale.set(1, 1, 1);
    model.castShadow = true;
    model.receiveShadow = true;
    scene.add(model);

    model.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        if (object.material.map) {
          object.material = new THREE.MeshStandardMaterial({
            map: object.material.map,
            normalMap: object.material.normalMap,
            roughness: 0.0,
            metalness: 0.5,
            emissive: 0xFFFFFF,
            emissiveIntensity: 0.1
          });
        } else {
          object.material = new THREE.MeshStandardMaterial({
            color: 0xD3D3D3,
            roughness: 0.2,
            metalness: 0.3,
            emissive: 0xFFFFFF,
            emissiveIntensity: 0.1
          });
        }
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
    console.error('Error loading model:', error);
  });

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;  // Пересчитываем соотношение сторон
  camera.updateProjectionMatrix();  // Обновляем проекционную матрицу камеры
  renderer.setSize(window.innerWidth, window.innerHeight);  // Устанавливаем новые размеры канваса
}

function onMouseMove(event) {
  mouseX = ((event.clientX - 60) / window.innerWidth) * 2 - 1;
  mouseY = ((event.clientY / window.innerHeight) * 2 - 1);
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

init();