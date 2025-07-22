import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

interface Car3DProps {
    modelPath: string;
    position: { x: number; y: number; z: number };
    rotation?: number;
    scale?: number;
    className?: string;
    autoRotate?: boolean;
}

const Car3D: React.FC<Car3DProps> = ({ 
    modelPath, 
    position, 
    rotation = 0, 
    scale = 1,
    className = "",
    autoRotate = false
}) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const modelRef = useRef<THREE.Object3D | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const animationIdRef = useRef<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const cleanup = useCallback(() => {
        // Stop animation loop
        if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
            animationIdRef.current = null;
        }

        // Remove renderer from DOM
        if (mountRef.current && rendererRef.current?.domElement) {
            try {
                mountRef.current.removeChild(rendererRef.current.domElement);
            } catch (e) {
                // Element might already be removed
            }
        }
        
        // Dispose of resources
        if (sceneRef.current) {
            sceneRef.current.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry?.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else if (object.material) {
                        object.material.dispose();
                    }
                }
            });
        }

        // Dispose renderer
        if (rendererRef.current) {
            rendererRef.current.dispose();
            rendererRef.current = null;
        }

        // Clear refs
        sceneRef.current = null;
        cameraRef.current = null;
        modelRef.current = null;
    }, []);

    useEffect(() => {
        if (!mountRef.current) return;

        // Wait for element to have dimensions
        const checkDimensions = () => {
            if (!mountRef.current || mountRef.current.clientWidth === 0 || mountRef.current.clientHeight === 0) {
                setTimeout(checkDimensions, 10);
                return;
            }

            // Cleanup any existing renderer
            cleanup();

            // Scene setup
            const scene = new THREE.Scene();
            sceneRef.current = scene;

            // Camera setup
            const camera = new THREE.PerspectiveCamera(
                75,
                mountRef.current.clientWidth / mountRef.current.clientHeight,
                0.1,
                1000
            );
            
            // Position camera for a better preview (slightly behind, to the side, and above)
            camera.position.set(2, 1.5, 4);
            camera.lookAt(0, 0, 0);
            cameraRef.current = camera;

            // Renderer setup with better configuration
            const renderer = new THREE.WebGLRenderer({ 
                antialias: true, 
                alpha: true,
                powerPreference: 'high-performance'
            });
            rendererRef.current = renderer;
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
            renderer.shadowMap.enabled = false; // Disable shadows for performance
            
            // Style the canvas to fit the container
            renderer.domElement.style.width = '100%';
            renderer.domElement.style.height = '100%';
            renderer.domElement.style.display = 'block';
            
            mountRef.current.appendChild(renderer.domElement);
            
            console.log('Renderer created with dimensions:', mountRef.current.clientWidth, 'x', mountRef.current.clientHeight);

            // Optimized lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(2, 5, 2);
            scene.add(directionalLight);

            // Load the car model
            const gltfLoader = new GLTFLoader();
            setIsLoading(true);
            gltfLoader.load(
                modelPath,
                (gltf) => {
                    if (!sceneRef.current) return; // Check if component is still mounted
                    
                    const model = gltf.scene;
                    modelRef.current = model;
                    
                    // Set model properties
                    model.scale.set(scale, scale, scale);
                    model.position.set(position.x, position.y, position.z);
                    model.rotation.y = rotation;
                    
                    // Optimize model for performance
                    model.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = false;
                            child.receiveShadow = false;
                        }
                    });
                    
                    sceneRef.current.add(model);
                    setIsLoading(false);
                    console.log('3D model loaded successfully:', modelPath);
                },
                (progress) => {
                    console.log('Loading progress:', progress);
                },
                (error) => {
                    console.error(`Error loading car model from ${modelPath}:`, error);
                    console.error('Full error details:', error);
                    setIsLoading(false);
                }
            );

            // Optimized animation loop
            const animate = () => {
                if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
                    return;
                }
                
                // Auto-rotate the model if enabled
                if (autoRotate && modelRef.current) {
                    modelRef.current.rotation.y += 0.01; // Smooth rotation
                }
                
                animationIdRef.current = requestAnimationFrame(animate);
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            };
            animate();

            // Handle resize
            const handleResize = () => {
                if (mountRef.current && cameraRef.current && rendererRef.current) {
                    const width = mountRef.current.clientWidth;
                    const height = mountRef.current.clientHeight;
                    
                    cameraRef.current.aspect = width / height;
                    cameraRef.current.updateProjectionMatrix();
                    rendererRef.current.setSize(width, height);
                }
            };
            window.addEventListener('resize', handleResize);

            // Cleanup function
            return () => {
                window.removeEventListener('resize', handleResize);
                cleanup();
            };
        };

        checkDimensions();
    }, [modelPath, position.x, position.y, position.z, rotation, scale, autoRotate, cleanup]);

    // Update position when it changes
    useEffect(() => {
        if (modelRef.current) {
            modelRef.current.position.set(position.x, position.y, position.z);
        }
    }, [position.x, position.y, position.z]);

    return (
        <div className={`relative w-full h-full ${className}`}>
            <div 
                ref={mountRef} 
                className="w-full h-full"
                style={{
                    display: 'block',
                    width: '100%',
                    height: '100%'
                }}
            />
            {isLoading && (
                <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-2"></div>
                        <p className="text-sm">Loading 3D Model...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Car3D;
