import { getRandomColor } from "../utils/Color";
import Vector from "../utils/Vector";
import type { ParticleSettings } from "./ParticleCanvasContext";


export class Particle {
    public spawn: Vector;
    public pos: Vector;
    public radius: number;
    public color: string;
    public og_color: string;
    public velocity: Vector = new Vector(0, 0);
    public settings: ParticleSettings;

    constructor(x: number, y: number, radius: number, 
        color: string = getRandomColor(), settings: ParticleSettings) {
        this.spawn = new Vector(x, y);
        this.pos = new Vector(x, y);
        this.radius = radius;
        this.color = color;
        this.og_color = color;
        this.settings = settings;
    }

    applyForce(vec_to_cursor: Vector): void {
        let totalForce: Vector = new Vector(0, 0);
        {
            const vec_to_spawn = this.pos.to(this.spawn.x, this.spawn.y);
            const scale_vec_generated = this.accelerationSpawn(vec_to_spawn.getMagnitude());
            vec_to_spawn.scale(scale_vec_generated);
            
            const scale_vec_cursor = this.accelerationCursor(vec_to_cursor.getMagnitude());
            vec_to_cursor.scale(-scale_vec_cursor);

            totalForce = Vector.add(vec_to_spawn, vec_to_cursor);
            
        }

        // F_error es la fuerza minima para que se aplique movimiento
        if (totalForce.getMagnitude() > this.settings.F_error) {          
            this.velocity.add(totalForce);        
            if (this.settings.velocityIndicator) {
                this.color = "#ff0000";
            }
            this.velocity.scale(this.settings.friction);
            this.pos.add(this.velocity);
        } else {
            if (this.settings.velocityIndicator) {
                this.color = this.og_color;
            }
        }
    }

    accelerationCursor(w: number): number {
        return Math.max(Math.pow(10, this.settings.minStep), 1 / ( this.settings.stiffness * Math.log(w + 1.001) ));    
    }


    accelerationSpawn(w: number): number {
        return Math.max(Math.pow(10, this.settings.minStep), Math.sin(Math.min(w, 0.5) / 150) * this.settings.stiffness);
    }

    
    
}
