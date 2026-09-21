/**
 * T011.9 sophora 材质真实编译验证页（011.8 教训：中断即未验证——任何 GLSL 改动必须
 * 先过真实编译再收口）。三工厂 × 3 档全部实例化 + PlaneGeometry 挂 Mesh 渲染 1 帧
 * （几何未合并前用 quad 验证 GLSL 编译），CDP 抓 console——三档九材质零错误零警告
 * 才算过。X4000 若出现按 011.6 终裁口径接受记档（记入 warnings 由驱动侧裁定）。
 */
import * as THREE from 'three';
import {
  createSophoraBarkMaterial,
  createSophoraLeafDepthMaterial,
  createSophoraLeafMaterial,
} from '/src/runtime/procedural/tree/sophora/sophoraMaterials';

interface CheckResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  programs: number;
  drawCalls: number;
  triangles: number;
  webgl: string;
}

function main(): void {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 640;
  document.body.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(640, 640, false);
  const gl = renderer.getContext();
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1.6, 1.6, 1.6, -1.6, 0.1, 10);
  camera.position.z = 2;
  const sun = new THREE.DirectionalLight(0xffffff, 2.0);
  sun.position.set(2, 3, 4);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const levels = ['high', 'mid', 'low'] as const;
  const materials: THREE.Material[] = [];
  for (const level of levels) {
    materials.push(createSophoraLeafMaterial(level));
    materials.push(createSophoraBarkMaterial(level));
    materials.push(createSophoraLeafDepthMaterial(level));
  }
  // 9 卡 3×3 网格铺开（alphaTest 材质各自出卡——程序逐材质编译）
  const geo = new THREE.PlaneGeometry(1.0, 1.0);
  materials.forEach((material, i) => {
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(((i % 3) - 1) * 1.1, (Math.floor(i / 3) - 1) * 1.1, 0);
    scene.add(mesh);
  });

  renderer.render(scene, camera); // 1 帧——九材质程序全部编译并执行

  const programs = renderer.info.programs?.length ?? -1;
  const result: CheckResult = {
    ok: (window as unknown as { __SOPHORA_ERRORS: string[] }).__SOPHORA_ERRORS.length === 0,
    errors: (window as unknown as { __SOPHORA_ERRORS: string[] }).__SOPHORA_ERRORS,
    warnings: (window as unknown as { __SOPHORA_WARNINGS: string[] }).__SOPHORA_WARNINGS,
    programs,
    drawCalls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    webgl: (gl instanceof WebGL2RenderingContext) ? 'WebGL2' : 'unknown',
  };
  (window as unknown as { __SOPHORA_COMPILE_CHECK: CheckResult }).__SOPHORA_COMPILE_CHECK = result;
  console.log('SOPHORA-COMPILE-CHECK ' + JSON.stringify(result));
}

main();
