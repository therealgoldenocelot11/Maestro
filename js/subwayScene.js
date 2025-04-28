import { Scene3D } from '@enable3d/phaser-extension';
import * as THREE from 'three';

export default class SubwayScene extends Scene3D {
    constructor() {
        super({ key: 'SubwayScene' });

        this.colliders = [];
        this.collidersVisible = false;
        this.flyMode = false;

        this.wallColliders = [];
        this.floorColliders = [];
        this.ceilingColliders = [];
        this.stairColliders = [];

        this.isGrounded = false;
        this.verticalVelocity = 0;
        this.gravity = -30;
        this.jumpForce = 8;
        this.maxStepHeight = 0.4;

        this.guns = [];
    }

    init() {
        this.accessThirdDimension({ gravity: { y: 0 } });
    }

    preload() {
        this.load.audio('background', 'assets/sound effects/untitled.ogg');
    }

    async create() {
        this.third.lights.ambientLight({ intensity: 0.5 });

        const gltf = await this.third.load.gltf(
            '/assets/models/SubwayScene.glb'
        );

        this.backgroundMusic = this.sound.add('background', {
            loop: true,
            volume: 0.5,
        });
        this.backgroundMusic.play();

        const scene = gltf.scene;
        scene.updateMatrixWorld(true);

        this.third.add.existing(scene);

        scene.traverse((child) => {
            if (!child.isMesh) return;

            const name = child.name.toLowerCase();
            const tag = child.userData.tag?.toLowerCase() || '';

            if (tag === 'gun') {
                this.guns.push(child);
            }

            if (name.includes('wallart') || name.includes('turnstile')) return;

            const isPhysicsObject =
                name.includes('fixed_phys') ||
                name.includes('collider') ||
                name.includes('floor') ||
                name.includes('wall') ||
                name.includes('stairs');
            if (!isPhysicsObject) return;

            const bbox = new THREE.Box3().setFromObject(child);
            const size = new THREE.Vector3();
            const center = new THREE.Vector3();
            bbox.getSize(size);
            bbox.getCenter(center);

            if (size.x < 0.05 || size.y < 0.05 || size.z < 0.05) return;

            const collider = this.third.add.box(
                {
                    x: center.x,
                    y: center.y,
                    z: center.z,
                    width: size.x,
                    height: size.y,
                    depth: size.z,
                },
                {
                    lambert: {
                        color: 0xff00ff,
                        transparent: true,
                        opacity: 0,
                    },
                    mass: 0,
                }
            );

            collider.visible = false;

            this.colliders.push(collider);

            if (tag.includes('wall')) this.wallColliders.push(collider);
            if (tag.includes('floor')) this.floorColliders.push(collider);
            if (tag.includes('ceiling')) this.ceilingColliders.push(collider);
            if (tag.includes('stairs')) this.stairColliders.push(collider);
        });

        this.player = this.third.add.box(
            { x: 0, y: 2, z: 0, width: 0.6, height: 1.8, depth: 0.6 },
            { lambert: { color: 0x00ff00, transparent: true, opacity: 0 } }
        );
        this.player.visible = false;

        this.cameraHeightOffset = 1.0;
        this.third.camera.position.set(0, 2 + this.cameraHeightOffset, 5);
        this.third.camera.lookAt(this.player.position);

        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE,E');
        this.walkSpeed = 5;
        this.flySpeed = 0.2;
        this.yaw = 0;
        this.pitch = 0;

        this.input.mouse.requestPointerLock();
        this.input.on('pointerdown', () => {
            if (!this.input.mouse.locked) this.input.mouse.requestPointerLock();
        });

        this.input.on('pointermove', (pointer) => {
            if (this.input.mouse.locked) {
                const sensitivity = 0.002;
                this.yaw -= pointer.movementX * sensitivity;
                this.pitch -= pointer.movementY * sensitivity;

                const maxPitch = Math.PI / 2 - 0.1;
                const minPitch = -Math.PI / 2 + 0.1;
                this.pitch = Phaser.Math.Clamp(this.pitch, minPitch, maxPitch);
            }
        });
    }

    update() {
        if (!this.keys || !this.player) return;

        this.isGrounded = false;

        let inputVelocity = new THREE.Vector3(0, 0, 0);

        if (this.keys.W.isDown) inputVelocity.z = -1;
        if (this.keys.S.isDown) inputVelocity.z = 1;
        if (this.keys.A.isDown) inputVelocity.x = -1;
        if (this.keys.D.isDown) inputVelocity.x = 1;

        inputVelocity.normalize();
        inputVelocity.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

        let moveDelta = new THREE.Vector3(
            (inputVelocity.x * this.walkSpeed * this.game.loop.delta) / 1000,
            0,
            (inputVelocity.z * this.walkSpeed * this.game.loop.delta) / 1000
        );

        const predictedPosition = this.player.position.clone().add(moveDelta);
        const predictedBox = new THREE.Box3().setFromCenterAndSize(
            predictedPosition,
            new THREE.Vector3(0.5, 1.8, 0.5)
        );

        for (const wall of this.wallColliders) {
            const wallBox = new THREE.Box3().setFromObject(wall);
            wallBox.expandByScalar(0.05);
            if (predictedBox.intersectsBox(wallBox)) {
                if (Math.abs(moveDelta.x) > Math.abs(moveDelta.z)) {
                    moveDelta.x = 0;
                } else {
                    moveDelta.z = 0;
                }
            }
        }

        this.player.position.add(moveDelta);

        this.verticalVelocity += (this.gravity * this.game.loop.delta) / 1000;
        this.player.position.y +=
            (this.verticalVelocity * this.game.loop.delta) / 1000;

        const playerBox = new THREE.Box3().setFromCenterAndSize(
            this.player.position,
            new THREE.Vector3(0.5, 1.8, 0.5)
        );

        const checkSurfaceCollision = (colliders, label) => {
            for (const collider of colliders) {
                const box = new THREE.Box3().setFromObject(collider);
                box.expandByScalar(0.05);
                if (playerBox.intersectsBox(box)) {
                    if (label === 'FLOOR' || label === 'STAIRS') {
                        this.isGrounded = true;
                        const targetY = box.max.y + 0.9;
                        if (
                            this.player.position.y <
                            targetY + this.maxStepHeight
                        ) {
                            this.player.position.y = Math.max(
                                this.player.position.y,
                                targetY
                            );
                            this.verticalVelocity = 0;
                        }
                    }
                    if (label === 'CEILING') {
                        if (this.verticalVelocity > 0)
                            this.verticalVelocity = 0;
                    }
                }
            }
        };

        checkSurfaceCollision(this.floorColliders, 'FLOOR');
        checkSurfaceCollision(this.stairColliders, 'STAIRS');
        checkSurfaceCollision(this.ceilingColliders, 'CEILING');

        if (
            this.isGrounded &&
            Phaser.Input.Keyboard.JustDown(this.keys.SPACE)
        ) {
            this.verticalVelocity = this.jumpForce;
        }

        this.third.camera.position.set(
            this.player.position.x,
            this.player.position.y + this.cameraHeightOffset,
            this.player.position.z
        );

        this.third.camera.rotation.order = 'YXZ';
        this.third.camera.rotation.y = this.yaw;
        this.third.camera.rotation.x = this.pitch;

        this.guns.forEach((gun) => {
            const playerPos = this.player.position;
            const gunPos = gun.getWorldPosition(new THREE.Vector3());
            const distance = playerPos.distanceTo(gunPos);

            if (distance < 2) {
                if (gun.material) {
                    gun.material.emissive = new THREE.Color(0x00ff00);
                    gun.material.emissiveIntensity = 1;
                }
            } else {
                if (gun.material) {
                    gun.material.emissive = new THREE.Color(0x000000);
                    gun.material.emissiveIntensity = 0;
                }
            }
        });

        if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
            const playerPos = this.player.position;

            this.guns.forEach((gun) => {
                const gunPos = gun.getWorldPosition(new THREE.Vector3());
                const distance = playerPos.distanceTo(gunPos);

                if (distance < 2) {
                    if (this.backgroundMusic) {
                        this.backgroundMusic.stop();
                    }
                    this.scene.stop('SubwayScene');
                    this.scene.start('TransitionScene');
                }
            });
        }
    }
}
