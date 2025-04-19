import { Scene3D } from '@enable3d/phaser-extension';
import * as THREE from 'three';

export default class SubwayScene extends Scene3D {
    constructor() {
        super({ key: 'SubwayScene' });
    }

    init() {
        this.accessThirdDimension({ gravity: { y: -9.87 } });
    }

    async create() {
        this.third.lights.ambientLight({ intensity: 0.5 });

        const gltf = await this.third.load.gltf(
            'assets/models/SubwayScene.glb'
        );
        const scene = gltf.scene;
        scene.scale.set(1, 1, 1);
        this.third.add.existing(scene);
        this.third.physics.add.existing(scene, { shape: 'concave', mass: 0 });

        this.player = this.third.physics.add.capsule(
            { x: 0, y: 2, z: 0 },
            { radius: 0.08, height: 0.9, mass: 1 }
        );
        this.player.body.setFriction(0.8);
        this.player.body.setAngularFactor(0, 0, 0);
        
        this.cameraHeightOffset = 0.8;        
        
        this.player.material.visible = true;

        this.third.camera.position.set(0, 1 + this.cameraHeightOffset, 5);
        this.third.camera.lookAt(this.player.position);

        this.keys = this.input.keyboard.addKeys('W,A,S,D');
        this.moveSpeed = 5;

        this.yaw = 0;
        this.pitch = 0;
        this.moveSpeed = 5;
        this.cameraHeightOffset = 0.9;

        this.input.mouse.requestPointerLock();
        this.input.on('pointerdown', () => {
            if (!this.input.mouse.locked) {
                this.input.mouse.requestPointerLock();
            }
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
    
        let inputVelocity = new THREE.Vector3(0, 0, 0);
    
        if (this.keys.W.isDown) inputVelocity.z = -1;
        if (this.keys.S.isDown) inputVelocity.z = 1;
        if (this.keys.A.isDown) inputVelocity.x = -1;
        if (this.keys.D.isDown) inputVelocity.x = 1;
    
        inputVelocity.normalize();
    
        inputVelocity.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    
        const body = this.player.body;
        body.setVelocity(
            inputVelocity.x * this.moveSpeed,
            body.velocity.y,
            inputVelocity.z * this.moveSpeed
        );
    
        this.third.camera.position.set(
            this.player.position.x,
            this.player.position.y + this.cameraHeightOffset,
            this.player.position.z
        );
    
        this.third.camera.rotation.order = 'YXZ';
        this.third.camera.rotation.y = this.yaw;
        this.third.camera.rotation.x = this.pitch;
    }
    
}
