import { getRandomColor } from "../utils/Color";
import Vector from "../utils/Vector";

const friction: number = 0.8;
const stiffness: number = 10;
const F_error: number = 0.01;
const VEL_INDICATOR: boolean = false;
// F_error es la fuerza mínima para que se considere un movimiento.

function accelerationCursor(w: number): number {
    return 1 / ( stiffness * Math.log(w + 1.001) );    
}


function accelerationSpawn(w: number): number {
    return Math.sin(w / 100) * stiffness;
}

export default class Particle {
    public spawn: Vector;
    public pos: Vector;
    public radius: number;
    public color: string;
    public og_color: string;
    public velocity: Vector = new Vector(0, 0);

    constructor(x: number, y: number, radius: number, 
        color: string = getRandomColor()) {
        this.spawn = new Vector(x, y);
        this.pos = new Vector(x, y);
        this.radius = radius;
        this.color = color;
        this.og_color = color;
    }

    applyForce(vec_to_cursor: Vector): void {
        let totalForce: Vector = new Vector(0, 0);
        {
            const vec_to_spawn = this.pos.to(this.spawn.x, this.spawn.y);
            const scale_vec_generated = accelerationSpawn(vec_to_spawn.getMagnitude());
            vec_to_spawn.scale(scale_vec_generated);
            
            const scale_vec_cursor = accelerationCursor(vec_to_cursor.getMagnitude());
            vec_to_cursor.scale(-scale_vec_cursor);

            totalForce = Vector.add(vec_to_spawn, vec_to_cursor);
            
        }


        if (totalForce.getMagnitude() > F_error) {          
            this.velocity.add(totalForce);        
            if (VEL_INDICATOR) {
                this.color = "#ff0000";
            }
            this.velocity.scale(friction);
            this.pos.add(this.velocity);
        } else {
            if (VEL_INDICATOR) {
                this.color = this.og_color;
            }
        }
    }    
}
