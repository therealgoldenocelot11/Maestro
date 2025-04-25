import { Scene3D } from '@enable3d/phaser-extension';
import * as THREE from 'three';

export default class SubwayScene extends Scene3D {
    constructor() {
        super({ key: 'SubwayScene' });
    }

    async init() {
        this.accessThirdDimension({ gravity: { y: -9.87 } });
    }

    createRampFromStair(mesh) {
        const geometry = mesh.geometry;
        geometry.computeBoundingBox();
    
        const bbox = geometry.boundingBox;
    
        const localMin = new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z);
        const localMax = new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.max.z);
    
        const minWorld = mesh.localToWorld(localMin.clone());
        const maxWorld = mesh.localToWorld(localMax.clone());
    
        const height = maxWorld.y - minWorld.y;
        const length = maxWorld.z - minWorld.z; // adjust axis as needed
    
        const angle = Math.atan2(height, Math.abs(length));
        const mid = new THREE.Vector3().addVectors(minWorld, maxWorld).multiplyScalar(0.5);
    
        const ramp = this.third.add.box(
            { x: mid.x, y: mid.y, z: mid.z, width: mesh.scale.x, depth: mesh.scale.z, height: mesh.scale.y },
            { lambert: { color: 0x4444ff } }
        );
    
        ramp.rotation.x = -angle;
        this.third.physics.add.existing(ramp, { shape: 'box', mass: 0 });
    }
    

    async create() {
        this.third.lights.ambientLight({ intensity: 0.5 });
    
        const gltf = await this.third.load.gltf('assets/models/SubwayScene.glb');
        const scene = gltf.scene;
        scene.scale.set(1, 1, 1);
        this.third.add.existing(scene);
    
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
        
                const tag = child.userData.tag;
        
                if (tag === 'WALL' || tag === 'DOOR' || tag === 'FLOOR') {
                    const bbox = new THREE.Box3().setFromObject(child);
                    const size = new THREE.Vector3();
                    const center = new THREE.Vector3();
                    bbox.getSize(size);
                    bbox.getCenter(center);
        
                    const collider = this.third.add.box(
                        { 
                            x: center.x, 
                            y: center.y, 
                            z: center.z, 
                            width: size.x, 
                            height: size.y, 
                            depth: size.z 
                        },
                        { lambert: { color: 0xff0000, transparent: true, opacity: 0.0 } }
                    );
        
                    this.third.physics.add.existing(collider, { shape: 'box', mass: 0 });
                }
        
                if (tag === 'STAIRS') {
                    this.createRampFromStair(child);
                }
            }
        });        
    
        // Player capsule setup
        this.player = this.third.physics.add.capsule(
            { x: 0, y: 1.5, z: 0 },
            { radius: 0.08, height: 0.9, mass: 1 }
        );
        this.player.body.setFriction(0.8);
        this.player.body.setAngularFactor(0, 0, 0);
        this.cameraHeightOffset = 0.9;
        this.player.material.visible = true;
    
        this.third.camera.position.set(0, 1 + this.cameraHeightOffset, 5);
        this.third.camera.lookAt(this.player.position);
    
        this.keys = this.input.keyboard.addKeys('W,A,S,D');
        this.moveSpeed = 5;
        this.yaw = 0;
        this.pitch = 0;
    
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
    
        //Camera follow
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
