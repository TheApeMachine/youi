import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import * as THREE from "three";
import gsap from "gsap";
import { eventBus } from "@/lib/event";
import { EventPayload } from "@/lib/event";
import "@/assets/neural.css";

interface Neuron {
    position: THREE.Vector3;
    connections: THREE.Line[];
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    energy: number;
}

type Axis = 'x' | 'y' | 'z';
const AXES: Axis[] = ['x', 'y', 'z'];

export const NeuralCanvas = Component({
    effect: () => {
        // Setup Three.js scene
        const container = document.getElementById("neural-canvas");
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Materials
        const neuronMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });

        const connectionMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.3
        });

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // Create neurons
        const neurons: Neuron[] = [];
        const neuronGeometry = new THREE.SphereGeometry(0.15, 32, 32);

        for (let i = 0; i < 50; i++) {
            const neuron: Neuron = {
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                ),
                connections: [],
                mesh: new THREE.Mesh(neuronGeometry, neuronMaterial.clone()),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02
                ),
                energy: Math.random()
            };

            neuron.mesh.position.copy(neuron.position);
            scene.add(neuron.mesh);
            neurons.push(neuron);
        }

        // Create connections
        neurons.forEach((neuron, i) => {
            const numConnections = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < numConnections; j++) {
                const target = neurons[(i + j + 1) % neurons.length];
                const geometry = new THREE.BufferGeometry().setFromPoints([
                    neuron.position,
                    target.position
                ]);
                const line = new THREE.Line(geometry, connectionMaterial.clone());
                scene.add(line);
                neuron.connections.push(line);
            }
        });

        // Position camera
        camera.position.z = 15;

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Update neurons
            neurons.forEach(neuron => {
                // Update position
                neuron.position.add(neuron.velocity);
                neuron.mesh.position.copy(neuron.position);

                // Bounce off boundaries
                AXES.forEach(axis => {
                    if (Math.abs(neuron.position[axis]) > 5) {
                        neuron.velocity[axis] *= -1;
                    }
                });

                // Pulse effect
                neuron.energy = Math.sin(Date.now() * 0.001 + neurons.indexOf(neuron)) * 0.5 + 0.5;
                (neuron.mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = neuron.energy * 0.5;

                // Update connections
                neuron.connections.forEach(connection => {
                    const positions = connection.geometry.attributes.position;
                    positions.setXYZ(0, neuron.position.x, neuron.position.y, neuron.position.z);
                    positions.needsUpdate = true;
                });
            });

            renderer.render(scene, camera);
        };

        // Handle window resize
        const onResize = () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };

        window.addEventListener('resize', onResize);

        // Subscribe to system events
        eventBus.subscribe("test", (event: EventPayload) => {
            // Create energy pulse at random neuron
            const neuron = neurons[Math.floor(Math.random() * neurons.length)];
            gsap.to(neuron.mesh.scale, {
                x: 2,
                y: 2,
                z: 2,
                duration: 0.2,
                yoyo: true,
                repeat: 1,
                ease: "power2.out"
            });
        });

        // Start animation
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', onResize);
            scene.traverse(object => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    (object.material as THREE.Material).dispose();
                }
            });
            renderer.dispose();
        };
    },
    render: () => {
        return (
            <div id="neural-canvas" className="neural-canvas" />
        );
    }
}); 