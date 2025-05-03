import CardItem from './Card'

const HotSearch = () => {
  return (
    <div className="pt-6 pb-6 pl-2 pr-2 bg-[#F5F6F8] h-[100%] rounded-xl">
      <div className="font-bold text-xl mb-4 pl-5">热门搜索</div>
      <div className="overflow-auto rounded-lg" style={{ height: 'calc(100% - 2.75rem)' }}>
        {new Array(3).fill('').map((i, index) => {
          return <CardItem />
        })}
      </div>
    </div>
  )
}

export default HotSearch
