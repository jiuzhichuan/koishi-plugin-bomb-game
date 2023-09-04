import { Context, Schema } from 'koishi';
export declare const name = "bomb-game";
export interface Config {
    主人QQ: string;
}
export declare const Config: Schema<Config>;
declare module 'koishi' {
    interface Tables {
        Bombs: Bomb_data;
    }
}
export interface Bomb_data {
    id: number;
    userId: string;
    gold: number;
    today: string;
    Bombs: number;
    Bombs_trigger: string;
    Clearance_trigger: string;
    Bomb_kill: number;
}
export declare function apply(ctx: Context, config: Config): void;
