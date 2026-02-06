import Cursor from "../Mouse/Cursor";
import Vector from "../utils/Vector";
import { Particle } from "./Particle";
import { useState, useEffect, useMemo } from "react";
import useParticleCanvasContext from "./ParticleCanvasContext";
import ParticleFactory from "./ParticleFactory";

export const DEFAULT_PARTICLE_COLOR: string = "#4181f8";

const particle_amount: number = 0;
const default_particle_radius: number = 1.5;
const default_cursor_radius: number = 30;

const friction: number = 0.8;
const stiffness: number = 10;
const VEL_INDICATOR: boolean = false;
const minStep: number = -2; // 10 ^ minstep 
const F_error: number = Math.pow(10, minStep) * 1.5;

export function ParticleCanvas() {

    const [particles, setParticles] = useState<Particle[]>([]);
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const [cursor, setCursor] = useState<Cursor | null>(new Cursor(default_cursor_radius, "#e1e1e1"));
    const [bounds, setBounds] = useState<DOMRect | null>(null);
    const [stateMemory, setStateMemory] = useState<Particle[]>([]);
    const [paintEnabled, setPaintEnabled] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const settings = useParticleCanvasContext(
        default_cursor_radius,
        default_particle_radius,
        DEFAULT_PARTICLE_COLOR,
        particle_amount,
        friction,
        stiffness,
        VEL_INDICATOR,
        minStep,
        F_error
    );

    const factory = useMemo(() => new ParticleFactory(settings), [settings]);

    function saveState(): void {
        setStateMemory(particles.map(
            p => {
                let newP = factory.createParticle(
                    new Vector(p.pos.x, p.pos.y),
                    new Vector(p.velocity.x, p.velocity.y)
                );
                return newP; 
            }
        ));
    }

    function shuffleParticles(): void {
        if (canvas) {
            setParticles(stateMemory.map(
                p => {
                    const x = Math.ceil(Math.random() * canvas.getBoundingClientRect().width);
                    const y = Math.ceil(Math.random() * canvas.getBoundingClientRect().height);
                    p.pos.x = x;
                    p.pos.y = y;
                    return p;
                }
            ));
        }
    }

    function resetAll(): void {
        setParticles([]);
        settings.setParticleAmount(particle_amount);
        settings.setParticleRadius(default_particle_radius);
        settings.setCursorRadius(default_cursor_radius);
        setPaintEnabled(false);
        setIsDragging(false);
        setStateMemory([]);
        settings.setStiffness(stiffness);
        settings.setFriction(friction);
        settings.setVelocityIndicator(VEL_INDICATOR);
        settings.setParticleColor(DEFAULT_PARTICLE_COLOR);
        if (cursor) {
            cursor.radius = default_cursor_radius;
        }
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }

    function handleTogglePaint(event: React.ChangeEvent<HTMLInputElement>): void {
        if (event.target.checked) {
            setPaintEnabled(true);
        } else {
            setPaintEnabled(false);
        }
    }

    function startDrag(event: React.MouseEvent): void {
        setIsDragging(true);
    }

    function endDrag(event: React.MouseEvent): void {
        setIsDragging(false);
    }

    function addParticleMatrix(particles: Particle[], spacing: number): void {
        // Paint particles in a circular shape (filling) the cursor's radius.
        if (cursor) {
            const centerX = cursor.pos.x;
            const centerY = cursor.pos.y;
            const radius = cursor.radius;
            for (let x = centerX - radius; x <= centerX + radius; x += settings.particleRadius + (2 * spacing)) {
                for (let y = centerY - radius; y <= centerY + radius; y += settings.particleRadius + (2 * spacing)) {
                    const dx = x - centerX;
                    const dy = y - centerY;
                    if (dx * dx + dy * dy <= radius * radius) {
                        particles.push(factory.createParticle(new Vector(x, y)));
                    }
                }
            }
        }
    }

    function handlePaint(event: React.MouseEvent): void {
        if (paintEnabled && cursor) {
            addParticleMatrix(particles, settings.particleRadius * 2);
        }
    }

    function updateParticles(): void {
        if (cursor) {
            cursor.applyForces(particles);
        }
    }

    function updateCanvas(): void {
        
        if (canvas && cursor && particles) {
            const ctx = canvas.getContext("2d");

            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                particles.forEach((particle: Particle) => {
                    drawParticle(ctx, particle);
                });
                
                drawCursor(ctx);
            }
        }
    }

    
    function updateCursor(event: React.MouseEvent): void {
        if (event && bounds && cursor) {
            cursor.update(event, bounds);
        }
    }

    function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle): void {
        if (ctx) {
            ctx.beginPath();
            ctx.arc(particle.pos.x, particle.pos.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
        }
        

    }

    function drawCursor(ctx: CanvasRenderingContext2D): void {
        if (cursor) {
            ctx.beginPath();
            ctx.arc(cursor.pos.x, cursor.pos.y, cursor.radius, 0, Math.PI * 2);
            ctx.strokeStyle = cursor.color;
            ctx.stroke();
        }
    }



    useEffect(() => {
        if (canvas) {
            const ctx = canvas.getContext("2d");
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            
            const scale = window.devicePixelRatio; 
            
            canvas.width = Math.floor(width * scale);
            canvas.height = Math.floor(height * scale);
            
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            if (ctx) {
                ctx.scale(scale, scale);
            }
            setBounds(canvas.getBoundingClientRect());
        }
    }, [canvas]);

    useEffect(() => {
        if (canvas) {
            const newParticles: Particle[] = [];
            for (let i = 0; i < settings.particleAmount; i++) {
                const x = Math.random() * canvas.getBoundingClientRect().width;
                const y = Math.random() * canvas.getBoundingClientRect().height;
                newParticles.push(factory.createParticle(new Vector(x, y)));
            }
            setParticles(newParticles);
        }
    }, [canvas, settings.particleAmount]);

    useEffect(() => {

        let animationFrameId: number;
        const render = () => {
            if (canvas && particles && cursor && bounds) {
                updateParticles();
                updateCanvas();
            }
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        }

    }, [particles, canvas, cursor, bounds]);

    // When physics settings change, update existing particles to reference the latest settings instance
    useEffect(() => {
        if (particles && particles.length > 0) {
            setParticles(prev => prev.map(p => { p.settings = settings; return p; }));
        }
    }, [settings.stiffness, settings.friction, settings.velocityIndicator]);

    return (
        <div className="w-full h-full bg-transparent">
                <div className="w-full flex p-2 gap-4 items-center select-none">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium select-none pr-2">Draw</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                            id="togglePaint"
                            type="checkbox"
                            className="sr-only peer"
                            checked={paintEnabled}
                            onChange={handleTogglePaint}
                            aria-label="Toggle draw mode"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors"></div>
                        <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transform transition-transform"></span>
                    </label>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium select-none pr-2">Velocity</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                            id="toggleVelocity"
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings.velocityIndicator}
                            onChange={(e) => settings.setVelocityIndicator(e.target.checked)}
                            aria-label="Toggle velocity indicator"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-300 transition-colors"></div>
                        <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transform transition-transform"></span>
                    </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch w-full sm:divide-x-2 sm:divide-gray-300 dark:sm:divide-gray-600">
                    <div className="flex flex-col gap-3 h-full pr-0 sm:pr-4">
                        <label className="flex items-center gap-3 select-none text-sm w-full h-12">
                            <span className="whitespace-nowrap w-28">Cursor Radius:</span>
                            <input
                                type="range"
                                min={10}
                                max={100}
                                value={settings.cursorRadius}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const value = e.currentTarget.valueAsNumber;
                                    const v = Number.isFinite(value) ? value : 30;
                                    settings.setCursorRadius(v);
                                    if (cursor) {
                                        cursor.radius = v;
                                    }
                                }}
                                className="flex-1 h-2 bg-transparent"
                            />
                            <span className="w-12 inline-block text-right tabular-nums">{settings.cursorRadius}</span>
                        </label>

                        <label className="flex items-center gap-3 select-none text-sm w-full h-12">
                            <span className="whitespace-nowrap w-28">Particle Radius:</span>
                            <input
                                type="range"
                                min={0.5}
                                max={5}
                                step={0.1}
                                value={settings.particleRadius}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const value = e.currentTarget.valueAsNumber;
                                    const v = Number.isFinite(value) ? value : 1.5;
                                    settings.setParticleRadius(v);
                                }}
                                className="flex-1 h-2 bg-transparent"
                            />
                            <span className="w-12 inline-block text-right tabular-nums">{settings.particleRadius.toFixed(1)}</span>
                        </label>
                    </div>

                    <div className="flex flex-col gap-3 h-full px-0 sm:px-4">
                        <label className="flex items-center gap-3 select-none text-sm w-full h-12">
                            <span className="whitespace-nowrap w-28">Particle Color:</span>
                            <input
                                type="color"
                                value={settings.particleColor}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => settings.setParticleColor(e.target.value)}
                                className="w-12 h-8 p-0 border-0 rounded"
                                aria-label="Select particle color"
                            />
                            <span className="w-12 inline-block text-right tabular-nums">{settings.particleColor}</span>
                        </label>

                        <label className="flex items-center gap-3 select-none text-sm w-full h-12">
                            <span className="whitespace-nowrap w-28">Particle Amount:</span>
                            <input
                                type="range"
                                min={0}
                                max={500}
                                value={settings.particleAmount}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => settings.setParticleAmount(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-transparent"
                            />
                            <span className="w-12 inline-block text-right tabular-nums">{settings.particleAmount}</span>
                        </label>
                    </div>

                    <div className="flex flex-col gap-3 h-full pl-0 sm:pl-4">
                        <label className="flex items-center gap-3 select-none text-sm w-full h-12">
                            <span className="whitespace-nowrap w-28">Stiffness:</span>
                            <input
                                type="range"
                                min={0.1}
                                max={20}
                                step={0.1}
                                value={settings.stiffness}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const value = e.currentTarget.valueAsNumber;
                                    const v = Number.isFinite(value) ? Math.min(20, Math.max(0.1, value)) : stiffness;
                                    settings.setStiffness(v);
                                }}
                                className="flex-1 h-2 bg-transparent"
                            />
                            <span className="w-12 inline-block text-right tabular-nums">{settings.stiffness.toFixed(1)}</span>
                        </label>

                        <label className="flex items-center gap-3 select-none text-sm w-full h-12">
                            <span className="whitespace-nowrap w-28">Friction:</span>
                            <input
                                type="range"
                                min={0.1}
                                max={1}
                                step={0.01}
                                value={settings.friction}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const value = e.currentTarget.valueAsNumber;
                                    const v = Number.isFinite(value) ? Math.min(1, Math.max(0.1, value)) : friction;
                                    settings.setFriction(v);
                                }}
                                className="flex-1 h-2 bg-transparent"
                            />
                            <span className="w-12 inline-block text-right tabular-nums">{settings.friction.toFixed(2)}</span>
                        </label>
                    </div>
                </div>
                <button
                    className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 active:scale-95 transform transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 select-none"
                    onClick={saveState}
                >
                    Save state
                </button>
                <button
                    className="px-4 py-2 rounded-md bg-transparent text-blue-600 font-medium border border-blue-600/20 hover:bg-blue-50 active:scale-95 transform transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 select-none"
                    onClick={shuffleParticles}
                >
                    Shuffle particles
                </button>
                <button
                    className="px-4 py-2 rounded-md bg-red-600 text-white font-medium shadow-md hover:bg-red-700 active:scale-95 transform transition-all text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 select-none"
                    onClick={resetAll}
                >
                    Reset
                </button>
            </div>
            <canvas id="ParticleCanvas" 
                onMouseMove={(event) => {
                    updateCursor(event);
                    if (isDragging && paintEnabled && cursor) {
                        handlePaint(event);
                    }
                }}
                onMouseDown={startDrag}
                onMouseUp={endDrag}
                className="w-full h-full border-2 border-red-500" ref={setCanvas}>
    
            </canvas>
        </div>
    );
}