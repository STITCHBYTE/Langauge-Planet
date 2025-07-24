import React, { useState } from 'react';
import Car3D from './Car3D.tsx';

interface CarOption {
    id: string;
    name: string;
    modelPath: string;
    previewImage: string;
    color: string;
}

interface CarSelectionProps {
    onCarSelect: (carId: string) => void;
    selectedCarId: string;
    onStartGame: () => void;
}

const CarSelection: React.FC<CarSelectionProps> = ({ onCarSelect, selectedCarId, onStartGame }) => {
    const [hoveredCarId, setHoveredCarId] = useState<string | null>(null);
    
    const carOptions: CarOption[] = [
        {
            id: 'race',
            name: 'Race Car',
            modelPath: '/kenney_car-kit/Models/GLB%20format/race.glb',
            previewImage: '/red-truck.svg',
            color: 'bg-red-500'
        },
        {
            id: 'race-future',
            name: 'Future Racer',
            modelPath: '/kenney_car-kit/Models/GLB%20format/race-future.glb',
            previewImage: '/blue-green-truck-mini.svg',
            color: 'bg-blue-500'
        },
        {
            id: 'sedan-sports',
            name: 'Sports Sedan',
            modelPath: '/kenney_car-kit/Models/GLB%20format/sedan-sports.glb',
            previewImage: '/orange-van.svg',
            color: 'bg-orange-500'
        },
        {
            id: 'suv-luxury',
            name: 'Luxury SUV',
            modelPath: '/kenney_car-kit/Models/GLB%20format/suv-luxury.glb',
            previewImage: '/black-truck.svg',
            color: 'bg-gray-800'
        },
        {
            id: 'police',
            name: 'Police Car',
            modelPath: '/kenney_car-kit/Models/GLB%20format/police.glb',
            previewImage: '/white-dumper.svg',
            color: 'bg-blue-900'
        },
        {
            id: 'van',
            name: 'Racing Van',
            modelPath: '/kenney_car-kit/Models/GLB%20format/van.glb',
            previewImage: '/yellow-mini-truck.svg',
            color: 'bg-yellow-500'
        }
    ];

    const selectedCar = carOptions.find(car => car.id === selectedCarId);
    const previewCar = hoveredCarId ? carOptions.find(car => car.id === hoveredCarId) : selectedCar;

    return (
        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl max-w-6xl w-full">
            <h2 className="text-4xl font-bold text-yellow-400 text-center mb-8">
                Choose Your Race Car
            </h2>
            
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {carOptions.map((car) => (
                            <div
                                key={car.id}
                                className={`relative cursor-pointer rounded-lg p-4 transition-all duration-300 hover:scale-105 ${
                                    selectedCarId === car.id
                                        ? 'ring-4 ring-yellow-400 bg-gray-700'
                                        : hoveredCarId === car.id
                                        ? 'ring-2 ring-blue-400 bg-gray-600'
                                        : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                                onClick={() => onCarSelect(car.id)}
                                onMouseEnter={() => setHoveredCarId(car.id)}
                                onMouseLeave={() => setHoveredCarId(null)}
                            >
                                <div className="flex flex-col items-center">
                                    <div className={`w-16 h-16 rounded-full ${car.color} flex items-center justify-center mb-2 shadow-lg`}>
                                        <img 
                                            src={car.previewImage} 
                                            alt={car.name} 
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                    <h3 className="text-white font-bold text-xs text-center">{car.name}</h3>
                                </div>
                                
                                {selectedCarId === car.id && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <span className="text-black text-xs font-bold">✓</span>
                                    </div>
                                )}
                                
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 max-w-md">
                    <h3 className="text-2xl font-bold text-white text-center mb-4">
                        {hoveredCarId ? '🔄 Hover Preview' : selectedCarId ? '🔄 Selected Car (Rotating)' : '🚗 Select Your Car'}
                    </h3>
                    <div className={`bg-gray-700 rounded-lg overflow-hidden transition-all duration-300 ${
                        hoveredCarId ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-400/20' : ''
                    }`} style={{ height: '256px', minHeight: '256px' }}>
                        {previewCar ? (
                            <div style={{ width: '100%', height: '256px', position: 'relative' }}>
                                <Car3D 
                                    key={previewCar.id}
                                    modelPath={previewCar.modelPath}
                                    position={{ x: 0, y: -0.3, z: 0 }}
                                    rotation={Math.PI / 4}
                                    scale={1.8}
                                    autoRotate={!hoveredCarId && !!selectedCarId}
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-gray-400 text-center">
                                    <div className="text-6xl mb-2">🚗</div>
                                    <p>Select a car to preview</p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {previewCar && (
                        <div className="mt-4 text-center">
                            <h4 className="text-xl font-bold text-yellow-400">{previewCar.name}</h4>
                            <p className="text-gray-300 text-sm">
                                {hoveredCarId ? 'Hover to preview' : 'Ready to race!'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="text-center mt-8">
                <button
                    onClick={onStartGame}
                    disabled={!selectedCarId}
                    className={`py-4 px-8 rounded-full font-bold text-xl transition-all duration-300 ${
                        selectedCarId
                            ? 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105 shadow-lg'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    Start Race!
                </button>
            </div>
        </div>
    );
};

export default CarSelection;
export type { CarOption };
