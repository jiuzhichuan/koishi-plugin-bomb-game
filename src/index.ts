import { Context, Schema, h , Random,Session,Logger} from 'koishi'
import {} from '@koishijs/plugin-adapter-onebot'
import { pathToFileURL } from 'url'
import { resolve } from 'path'
export const name = 'bomb-game'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

declare module 'koishi' {
  interface Tables {
  Bombs: Bomb_data
}}

// 这里是新增表的接口类型
export interface Bomb_data {
  id: number
  userId: string 
  gold: number 
  today: string 
  Bombs : number
  Bombs_trigger : string
  Clearance_trigger: string
  }
  const logger = new Logger('炸弹人')
export function apply(ctx: Context) {

  ctx.model.extend('Bombs', {
    id: 'unsigned',
    userId: 'string',
    today: 'string',
    Bombs: 'unsigned',
    Bombs_trigger: 'string',
    Clearance_trigger: 'string'
    })

  let Yes_or_no_bomb:number;
  let Bomb_group:string;


ctx.on('message',async(session) => {
const {content,userId} = session
const read = await ctx.database.get('Bombs', {userId});
if (content.includes(read?.[0]?.Bombs_trigger)){
  return session.execute('埋炸弹');}

if (content.includes(read?.[0]?.Clearance_trigger)){
  return session.execute('排雷');}
if(content.includes(read?.[0]?.Clearance_trigger) || content === '排雷'){
}else{
  if( Yes_or_no_bomb == 1 && Bomb_group === session.guildId){
  logger.info(session.userId +'恭喜你被炸弹炸到了');
  const time = Math.floor(Math.random() * 3) + 1;
  const timemax =time * 60;
  Yes_or_no_bomb = 0;
  session.bot.sendMessage(session.channelId,h.image(pathToFileURL(resolve(__dirname, './你怎么不说话.jpg')).href),session.guildId);
  session?.onebot.setGroupBan(session.channelId,session.userId,timemax)
}}
})
ctx.command('炸弹菜单').subcommand('排雷')
.action(async({session}) =>{
  const {userId} = session;
  if(Yes_or_no_bomb === 1){
    Yes_or_no_bomb = 0;
    logger.info(userId +'拆除炸弹成功');
    return '══排雷触发══&#10;状态：成功\n操作者：【' + h.at(userId) +'】&#10; 排雷成功\n如果失败，不会提示'
  }else{

  }
})

  ctx.command('炸弹菜单').subcommand('排雷触发 <Mine_clearance>')
  .action(async ({session},Mine_clearance) =>{
    const {userId} = session;
    const read = await ctx.database.get('Bombs', { userId });
    if( Mine_clearance === undefined ){
    return `══排雷触发══&#10;状态：失败\n操作者：【${h.at(userId)}】&#10; 原因：格式错误\n正确格式：排雷触发 触发词\nTips：这是设置埋炸弹的触发词`
}else if( Mine_clearance === '排雷' ){
    return `══排雷触发══&#10;状态：失败\n操作者：【${h.at(userId)}】&#10; 原因：不能和原触发词一样`
}
    if(Mine_clearance.length > 3) {
    if(!read?.[0]?.Bombs_trigger){
    session.bot.sendMessage(session.channelId,`══排雷触发══&#10;状态：失败\n操作者：【${h.at(userId)}】&#10;添加失败\n 原因：你还没有炸弹\nTips:发送【领取炸弹】领取炸弹吧` + Mine_clearance,session.guildId)[0];
}else{
    await ctx.database.set('Bombs', {userId},{Clearance_trigger:Mine_clearance});
    session.bot.sendMessage(session.channelId,`══排雷触发══&#10;状态：成功\n操作者：【${h.at(userId)}】&#10;设置成功\n 新的触发词是 + ${Mine_clearance}\nTips：不要设置过于简单的触发词\n如6,这种单个字\n暂不支持图片做触发词，后续开发看看`,session.guildId)[0];
}
}else {
return `══排雷触发══&#10;状态：失败\n操作者：【${h.at(userId)}】&#10;设置失败\n 原因：小于3个字`
    }
  })

  ctx.command('炸弹菜单').subcommand('领取炸弹')
  .action( async ({session}) => {
    const {userId} = session;
    const today = new Date().toISOString().split('T')[0];//当前时间
    const checkInRecord = await ctx.database.get('Bombs', { userId });//获取用户签到时间
    const one_phrase = await ctx.http.get('https://v1.hitokoto.cn/?c=a');
    const hitokoto = one_phrase.hitokoto + '——' + one_phrase.from ;
    const Bombs = 5;
    const msg = {
      signInSuccess:`══领取炸弹══&#10;状态：成功\n操作者：【${h.at(userId)}】&#10;领取成功\n获得炸弹5枚\n一言：${hitokoto}`,
      alreadySignedIn: `══领取炸弹══&#10;状态：失败\n操作者：【${h.at(userId)}】&#10;领取失败\n一言：${hitokoto} `,
    };
    //判断是否第一次
    if (checkInRecord.length === 0) {
      await ctx.database.create('Bombs', { userId, today,Bombs,Bombs_trigger:'暂无触发词',Clearance_trigger:'暂无触发词'});
      return msg.signInSuccess;
    }
    //判断用户是否领取
    if (checkInRecord[0].today === today){
      return msg.alreadySignedIn
    } else {
      console.log(msg.signInSuccess);
      await ctx.database.set('Bombs', {userId},{today,Bombs:checkInRecord[0].Bombs + Bombs });
      return msg.signInSuccess;
    }});

  ctx.command('炸弹菜单').subcommand('炸弹触发 <bobo>')
  .action(async({session},bobo) =>{
    const { userId, username} = session;
    const read = await ctx.database.get('Bombs', { userId });
    if( bobo === undefined ){
    return `══炸弹触发══&#10;状态：失败\n操作者：【${h.at(userId)}】&#10; 原因：格式错误\n正确格式：炸弹触发 触发词\nTips：这是设置埋炸弹的触发词`
}else if( bobo === '埋炸弹' ){
    return `══炸弹触发══&#10;状态：失败\n操作者：【${h.at(userId)}】&#10; 原因：不能和原触发词一样`
}
    if(bobo.length > 3) {
    if(!read?.[0]?.Bombs_trigger){
    session.bot.sendMessage(session.channelId,`══炸弹触发══&#10;状态：失败\n操作者：【${h.at(userId)}】&#10;添加失败\n 原因：你还没有炸弹\nTips:发送【领取炸弹】领取炸弹吧` + bobo,session.guildId)[0];
}else{
    await ctx.database.set('Bombs', {userId},{Bombs_trigger:bobo});
    session.bot.sendMessage(session.channelId,`══炸弹触发══&#10;状态：成功\n操作者：【${h.at(userId)}】&#10;设置成功\n 新的触发词是 + ${bobo}\nTips：不要设置过于简单的触发词\n如6,这种单个字\n暂不支持图片做触发词，后续开发看看`,session.guildId)[0];
}
}else {
return `══炸弹触发══&#10;状态：失败\n操作者：【${h.at(userId)}】&#10;设置失败\n 原因：小于3个字`
    }})
  
ctx.command('炸弹菜单').subcommand('埋炸弹')
.action(async({session}) =>{
const { userId, username} = session;
const read = await ctx.database.get('Bombs', { userId });
const manage = (await session.onebot.getGroupMemberInfo(session.channelId,session.bot.userId));
const manages = manage.role;
//console.log(manages);
if( manages == 'member'){
  return '我在此群没有权限，让你埋炸弹哦';
}
if (read?.[0]?.Bombs <=0 || !read?.[0]?.Bombs){
  return '你没有炸弹了';
}else{
  Yes_or_no_bomb = 1;
  Bomb_group = session.guildId;
  logger.info(userId +'设置炸弹成功');
  await ctx.database.set('Bombs', {userId},{Bombs:read[0].Bombs - 1});
}})}
