import { Context, Schema, h , Random,Session,Logger, Query} from 'koishi'
import {} from '@koishijs/plugin-adapter-onebot'
import { pathToFileURL } from 'url'
import { resolve } from 'path'
export const name = 'bomb-game'

export interface Config {
  主人QQ: string;
}

export const Config : Schema<Config> = Schema.object({
  主人QQ: Schema.string().default('1594817572').description('填写你的QQ，用于增加炸弹等')
})



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
  Bomb_kill : number
  }
  const logger = new Logger('炸弹人')

export function apply(ctx: Context,config: Config) {

  ctx.model.extend('Bombs', {
    id: 'unsigned',
    userId: 'string',
    today: 'string',
    Bombs: 'unsigned',
    Bombs_trigger: 'string',
    Clearance_trigger: 'string',
    Bomb_kill : 'unsigned'
    })

  let Yes_or_no_bomb:number;
  let Bomb_group:string;
  let Bomber_id:string


ctx.on('message',async(session) => {
const {content,userId} = session
const read = await ctx.database.get('Bombs', {userId});

if (content.includes(read?.[0]?.Bombs_trigger)){
  return session.execute('埋雷');}

if (content.includes(read?.[0]?.Clearance_trigger)){
  return session.execute('排雷');}

if(content.includes(read?.[0]?.Clearance_trigger) || content === '排雷'){
}else{
  if( Yes_or_no_bomb == 1 && Bomb_group === session.guildId){
  logger.info(Bomber_id+'使用炸弹击杀了' + userId);
  const time = Math.floor(Math.random() * 3) + 1;
  const timemax =time * 60;
  Yes_or_no_bomb = 0;
  await ctx.database.set('Bombs', {userId:Bomber_id},{Bomb_kill: + 1});
  Bomber_id = '0'
  session.bot.sendMessage(session.channelId,h.image(pathToFileURL(resolve(__dirname, './你怎么不说话.jpg')).href),session.guildId);
  session?.onebot.setGroupBan(session.channelId,session.userId,timemax)
}}
})

ctx.command('炸弹菜单')
.action(async({}) =>{
return `
══炸弹专家══
埋雷   抢雷  排雷
排雷触发 炸弹触发
领取炸弹 我的信息
雷人榜`
})

ctx.command('炸弹菜单')
.subcommand('抢雷 <rob>')
.shortcut(/^抢雷@ ?(.*)$/, { args: ['$1'] })
.action(async({session,next}) =>{
  const {userId} = session;
  const at = h.select(session.elements,'at');
  const ATID =at?.[0]?.attrs.id;
  const a = Math.floor(Math.random() * 1);
  const time = Math.floor(Math.random() * 3) + 1 * 60;
  const readA = await ctx.database.get('Bombs', { userId });
  const readB = await ctx.database.get('Bombs', {userId:ATID});
  session?.onebot.setGroupBan(session.channelId,session.userId,time)
  session?.onebot.setGroupBan(session.channelId,ATID,time)
  if (at.length === 0) {
return `
══抢雷失败══
状态：失败
操作者：【${h.at(userId)}】
你没有艾特被抢雷的人`
  }else{
  if(readB?.[0]?.Bombs <= 0){
return `
══抢雷失败══
状态：失败
操作者：【${h.at(userId)}】
对方没有炸弹！`
  }else if( a == 0){
  return `
══抢雷触发══
状态：失败
抢劫者：【${h.at(userId)}】
被抢者：【${h.at(ATID)}】
由于抢夺期间，过于激烈
导致炸弹爆炸，双方被炸到并
各损失1枚炸弹`}
  else if (a == 1){
    await ctx.database.set('Bombs', {userId},{Bombs:readA[0].Bombs + 1});
    await ctx.database.set('Bombs', {userId:ATID},{Bombs:readB[0].Bombs - 1});
  return `
══抢雷触发══
状态：成功
抢劫者：【${h.at(userId)}】
被抢者：【${h.at(ATID)}】
抢夺了1枚炸弹
对方失去一枚炸弹`
}
}
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
    return `══排雷触发══&#10;状态：失败\n操作者：【${h.at(userId)}】&#10; 原因：格式错误\n正确格式：排雷触发 触发词\nTips：这是排除炸弹的触发词`
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
      await ctx.database.create('Bombs', { userId, today,Bombs,Bombs_trigger:'暂无触发词',Clearance_trigger:'暂无触发词',Bomb_kill:0});
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
    return `══炸弹触发══&#10;状态：失败\n操作者：【${h.at(userId)}】&#10; 原因：格式错误\n正确格式：炸弹触发 触发词\nTips：这是设置埋雷的触发词`
}else if( bobo === '埋雷' ){
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
  
ctx.command('炸弹菜单').subcommand('埋雷')
.action(async({session}) =>{
const { userId, username} = session;
const read = await ctx.database.get('Bombs', { userId });
const manage = (await session.onebot.getGroupMemberInfo(session.channelId,session.bot.userId));
const manages = manage.role;
//console.log(manages);
if( manages == 'member'){
  return '我在此群没有权限，让你埋雷哦';
}
if (read?.[0]?.Bombs <=0 || !read?.[0]?.Bombs){
  return '你没有炸弹了';
}else{
  Yes_or_no_bomb = 1;
  Bomb_group = session.guildId;
  Bomber_id = session.userId;
  logger.info(userId +'设置炸弹成功');
  await ctx.database.set('Bombs', {userId},{Bombs:read[0].Bombs - 1});
}})

ctx.command('炸弹菜单')
.subcommand('我的信息')
.action(async({session}) =>{
  const { userId, username} = session;
const read = await ctx.database.get('Bombs', { userId });
if( userId === config.主人QQ){
  return `══我的信息══\n操作者：${config.主人QQ}\n身份：主人\n炸弹数量；${read?.[0]?.Bombs}\n击杀数量：${read?.[0]?.Bomb_kill}\n可用指令：\n增加炸弹 [艾特某人] [数量]`
}else {
  return `══我的信息══\n操作者：${userId}\n身份：成员\n炸弹数量；${read?.[0]?.Bombs}\n击杀数量：${read?.[0]?.Bomb_kill}`  
}
})

ctx.command('炸弹菜单')
.subcommand('增加炸弹 <ID> <num:number>')
.shortcut(/^增加炸弹(.*) ?([0-9]*)$/, { args: ['$1','$2'] })
.action(async({session,next},ID,num) =>{
  const {userId} = session;
  const at = h.select(session.elements,'at');
  const ATID = at?.[0]?.attrs.id;
  const a = Math.floor(Math.random() * 1);
  if(userId === config.主人QQ){
  if (at.length === 0) {
return `
══增加失败══
状态：失败
操作者：【${h.at(userId)}】
你没有艾特要增加的人`
  }else{
    const readB = await ctx.database.get('Bombs', {userId:ATID});
    await ctx.database.set('Bombs', {userId:ATID},{Bombs:readB?.[0]?.Bombs + num});
return `
══增加成功══
状态：成功
操作者：【${h.at(userId)}】
成功添加${num}枚炸弹`
  }
  }else {
return '══增加失败══\
状态：失败\
操作者：【${h.at(userId)}】\
你没有权限'
  }
})

ctx.command('炸弹菜单')
.subcommand('雷人榜')
.action(async ({ session }) => {
  const { userId } = session;
  const read = await ctx.database.get('Bombs', {});
  const data = [];
  const manage = (await session.onebot.getGroupMemberInfo(session.channelId,session.bot.userId));
const manages = manage.role;
//console.log(manages);
  // 创建随机数据
  for (let i = 0; i < read.length; i++) {
    const id = read?.[i]?.userId;
    const kill = read?.[i]?.Bomb_kill;
    data.push({ id, kill });
  }
  // 使用自定义的比较函数进行降序排序
  data.sort((a, b) => {
    return b.kill - a.kill;
  });
  // 截取前五个元素
  let tata = '';
  const topFive = data.slice(0, 5);
  for (let i = 0; i < topFive.length; i++) {
    tata += '══雷人榜══\n第' + (i+1) + '名: ' + topFive?.[i]?.id + '\n击杀数量：' + topFive?.[i]?.kill + '\n';
  }
  if( manages == 'owner'){
  session?.onebot?.setGroupSpecialTitle(session.channelId,topFive?.[0]?.id,'炸弹超人')
  session?.onebot?.setGroupSpecialTitle(session.channelId,topFive?.[1]?.id,'炸弹狂')
  return tata;
  }else {
  return tata;    
  }

})


//结尾
}
