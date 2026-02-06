import Cursor from "../Mouse/Cursor";
import Vector from "../utils/Vector";
import Particle from "./Particle";
import { useState, useEffect } from "react";

const particle_amount: number = 0;
const default_particle_radius: number = 1.5;
const default_cursor_radius: number = 40;

export default function ParticleCanvas() {

    const [particles, setParticles] = useState<Particle[]>([]);
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const [cursor, setCursor] = useState<Cursor | null>(new Cursor(default_cursor_radius, "#e1e1e1"));
    const [bounds, setBounds] = useState<DOMRect | null>(null);

    const [paintEnabled, setPaintEnabled] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    function handleTogglePaint(event: React.ChangeEvent<HTMLInputElement>): void {
        if (event.target.checked) {
            setPaintEnabled(true);
            console.log("Paint enabled");
        } else {
            setPaintEnabled(false);
            console.log("Paint disabled");
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
            for (let x = centerX - radius; x <= centerX + radius; x += default_particle_radius + (2 * spacing)) {
                for (let y = centerY - radius; y <= centerY + radius; y += default_particle_radius + (2 * spacing)) {
                    const dx = x - centerX;
                    const dy = y - centerY;
                    if (dx * dx + dy * dy <= radius * radius) {
                        particles.push(new Particle(x, y, default_particle_radius, "#4181f8"));
                    }
                }
            }
        }
    }

    function handlePaint(event: React.MouseEvent): void {
        if (paintEnabled && cursor) {
            addParticleMatrix(particles, default_particle_radius * 2);
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
            for (let i = 0; i < particle_amount; i++) {
                const x = Math.random() * canvas.getBoundingClientRect().width;
                const y = Math.random() * canvas.getBoundingClientRect().height;
                newParticles.push(new Particle(x, y, default_particle_radius, "#4181f8"));
            }
            setParticles(newParticles);
        }
    }, [canvas]);

    useEffect(() => {

        let animationFrameId: number;
        const render = () => {
            if (canvas && particles && cursor && bounds) {
                updateParticles(cursor, particles);
                updateCanvas(canvas, particles, cursor, bounds);
            }
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        }

    }, [particles, canvas, cursor, bounds]);

    return (
        <div className="w-full h-full">
            <input type="checkbox" onChange={handleTogglePaint} id="togglePaint" />
            <canvas id="ParticleCanvas" 
                onMouseMove={(event) => {
                    updateCursor(event, cursor, bounds);
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



function updateCursor(event: React.MouseEvent, cursor: Cursor | null, bounds: DOMRect | null): void {
    if (event && bounds && cursor) {
        cursor.update(event, bounds);
    }
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle): void {
    ctx.beginPath();
    ctx.arc(particle.pos.x, particle.pos.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
}

function drawCursor(canvas: HTMLCanvasElement | null, cursor: Cursor): void {
    if (canvas) {
        const ctx = canvas?.getContext("2d");
        if (ctx) {
            ctx.beginPath();
            ctx.arc(
                cursor.pos.x, 
                cursor.pos.y, 
                cursor.radius, 
                0, 
                Math.PI * 2
            );
            ctx.strokeStyle = cursor.color;
            ctx.stroke();
        }
    }
}

function updateParticles(cursor: Cursor, particles: Particle[]): void {
    if (cursor) {
        let affectedParticles = cursor.getParticlesInRange(particles);
        cursor.applyForces(affectedParticles);

        let filtered = particles.filter(particle => !affectedParticles.includes(particle));

        filtered.forEach((particle: Particle) => {
            particle.applyForce(Vector.Zero);
        });
    }
}

function updateCanvas(canvas: HTMLCanvasElement | null, particles: Particle[], cursor: Cursor | null, bounds: DOMRect | null): void {
    
    if (canvas && cursor && particles) {
        const ctx = canvas.getContext("2d");

        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((particle: Particle) => {
                drawParticle(ctx, particle);
            });
            
            drawCursor(canvas, cursor);
        }
    }
}