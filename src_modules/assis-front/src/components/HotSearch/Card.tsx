import collegeIcon from '@/assets/taxation/college.svg'
import eysIcon from '@/assets/taxation/eys.svg'
import likeIcon from '@/assets/taxation/like-icon.svg'

const CardItem = () => {
  return (
    <div className="bg-white h-56 rounded-lg pl-4 pr-4 pt-1 pb-4 mb-2">
      <div className="font-bold text-[1rem]">司法拍卖中不动产成交价格的税务问题分析</div>
      <div className="mt-2 text-small text-gray-400">
        法规解读 <span>2024-03-08</span>
      </div>
      <div className="flex text-small text-gray-400 mt-3">
        <div className="flex mr-5">
          <img src={eysIcon} className='mr-[.125rem]'/>4
        </div>
        <div className="flex mr-5">
          <img src={likeIcon} className='mr-[.125rem]'/>5
        </div>
        <div className="flex">
          <img src={collegeIcon} className='mr-[.125rem]' />
          12
        </div>
      </div>
      <div className="text-sm w-[100%] text-ellipsis">
        摘要：在实务中，法院拍卖公告对不动产成交价款是否含税执行标准不一致，所以具体的界定也是大相径庭，具体的处理方式以自己所属税务具体的处理方式以自己所属税务具体的处理方式以自己所属税务
      </div>
    </div>
  )
}

export default CardItem
