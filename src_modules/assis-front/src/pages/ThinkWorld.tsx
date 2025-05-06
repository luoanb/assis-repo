import { useEffect, useCallback, useState } from 'react'
import Tree from 'react-d3-tree'
import * as front from '@/utils/vscodeFrontend'
import * as d3 from 'd3'
import { Tooltip, Button } from 'antd'

const useCenteredTree = (defaultTranslate = { x: 0, y: 0 }) => {
  const [translate, setTranslate] = useState(defaultTranslate)
  const containerRef = useCallback(
    (containerElem: { getBoundingClientRect: () => { width: any; height: any } } | null) => {
      if (containerElem !== null) {
        const { width, height } = containerElem.getBoundingClientRect()
        setTranslate({ x: width / 3, y: height / 2 })
      }
    },
    []
  )
  return [translate as any, containerRef as any]
}

const PlayIcon = () => (
  <svg
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="4251"
    width="40"
    height="40"
  >
    <path
      d="M213.333333 65.386667a85.333333 85.333333 0 0 1 43.904 12.16L859.370667 438.826667a85.333333 85.333333 0 0 1 0 146.346666L257.237333 946.453333A85.333333 85.333333 0 0 1 128 873.28V150.72a85.333333 85.333333 0 0 1 85.333333-85.333333z m0 64a21.333333 21.333333 0 0 0-21.184 18.837333L192 150.72v722.56a21.333333 21.333333 0 0 0 30.101333 19.456l2.197334-1.152L826.453333 530.282667a21.333333 21.333333 0 0 0 2.048-35.178667l-2.048-1.386667L224.298667 132.416A21.333333 21.333333 0 0 0 213.333333 129.386667z"
      fill="#fff"
      p-id="4252"
      strokeWidth="4"
    ></path>
  </svg>
)

const RightIcon = ({ expand, onClick }: { expand: boolean; onClick: any }) => {
  return (
    <div onClick={onClick}>
      {expand ? (
        <svg
          id="svg"
          fill="#000000"
          stroke="#000000"
          width="22px"
          height="22px"
          version="1.1"
          viewBox="144 144 512 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="IconSvg_bgCarrier" stroke-width="0"></g>
          <g
            id="IconSvg_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke="#CCCCCC"
          ></g>
          <g id="IconSvg_iconCarrier">
            <g xmlns="http://www.w3.org/2000/svg">
              <path d="m393.11 455.34-64.941-21v93.207l64.941 21z" />
              <path d="m456.45 424.88-56.449-18.207-56.449 18.207 56.449 18.203z" />
              <path d="m215.09 334.07h373.84v-29.422c-0.011719-9.168-3.668-17.957-10.156-24.43-6.4883-6.4766-15.285-10.113-24.453-10.109h-136.61c-16.973-0.027344-32.699-8.9141-41.484-23.438l-11.406-18.965h0.003906c-6.2969-10.355-17.551-16.668-29.672-16.637h-89.438c-9.1602-0.023437-17.953 3.5938-24.441 10.059-6.4922 6.4609-10.145 15.238-10.164 24.398 0 0.52344 0.011719 0.90234 0.035157 1.4258z" />
              <path d="m205.86 559.26c1.1914 8.2422 5.3086 15.777 11.602 21.223 6.2969 5.4492 14.344 8.4453 22.668 8.4414h320.16c8.3398 0.007813 16.398-2.9961 22.695-8.4609 6.3008-5.4648 10.414-13.02 11.582-21.277l26.691-194.43v0.003907c0.64453-4.2852-0.62891-8.6328-3.4805-11.891-2.8555-3.2617-6.9961-5.0977-11.328-5.0234h-412.91c-3.957-0.011718-7.7539 1.5469-10.559 4.3359-2.8047 2.7891-4.3828 6.582-4.3906 10.535 0 0.66797 0.046875 1.3359 0.14453 1.9961zm108.53-134.38c-0.042969-2.9727 1.8516-5.6289 4.6758-6.5547l78.797-25.441v-0.003906c1.3672-0.44141 2.8398-0.44141 4.207 0l78.848 25.441v0.003907c2.8281 0.92578 4.7227 3.5781 4.6875 6.5547v107.68c0.039062 2.9727-1.8555 5.6289-4.6836 6.5547l-78.801 25.441v0.003906c-1.3633 0.44141-2.832 0.44141-4.1953 0l-78.848-25.441v-0.003907c-2.8281-0.92578-4.7227-3.5781-4.6875-6.5547z" />
              <path d="m406.89 548.54 64.945-21v-93.207l-64.945 21z" />
            </g>
          </g>
        </svg>
      ) : (
        <svg
          id="svg"
          fill="#000000"
          stroke="#000000"
          width="22"
          height="22"
          version="1.1"
          viewBox="144 144 512 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="IconSvg_bgCarrier" stroke-width="0"></g>
          <g
            id="IconSvg_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke="#CCCCCC"
          ></g>
          <g id="IconSvg_iconCarrier">
            <g xmlns="http://www.w3.org/2000/svg">
              <path d="m420.66 367.31-56.453 18.207 56.453 18.203 56.449-18.203z" />
              <path d="m348.83 488.18 64.941 21v-93.207l-64.941-21z" />
              <path d="m605.66 540.25v-211.2c0-16.82-13.941-30.406-30.762-30.406h-299.44c-16.82 0-30.93 13.586-30.93 30.406v242.16h330.37c16.82 0 30.762-14.148 30.762-30.969zm-99.387-47.047c0.039063 2.9727-1.8555 5.6289-4.6797 6.5547l-78.801 25.441h-0.003906c-1.3633 0.44531-2.832 0.44531-4.1953 0l-78.848-25.441c-2.8242-0.92578-4.7227-3.5781-4.6875-6.5547v-107.68c-0.042969-2.9727 1.8516-5.6289 4.6758-6.5586l78.797-25.441c1.3672-0.44141 2.8398-0.44141 4.207 0l78.848 25.441c2.8281 0.92969 4.7266 3.582 4.6875 6.5586z" />
              <path d="m225.1 571.21h5.6484v-242.16c0-24.418 20.289-44.184 44.707-44.184l110.93 0.003906-36.152-44.59c-5.7539-7.1836-14.43-11.406-23.633-11.5h-101.5c-16.82 0-30.758 14.152-30.758 30.969v280.5c0 16.82 13.938 30.969 30.758 30.969z" />
              <path d="m427.55 509.18 64.945-21v-93.207l-64.945 21z" />
            </g>
          </g>
        </svg>
      )}
    </div>
  )
}

const renderForeignObjectNode = ({ nodeDatum, toggleNode, foreignObjectProps }: any) => {
  return (
    <g>
      <circle r={8}></circle>
      {/* `foreignObject` requires width & height to be explicitly set. */}
      <foreignObject {...foreignObjectProps}>
        <div className="flex">
          <Tooltip
            title={
              <div>
                <div className="pb-0 pt-2 px-4 flex items-start">
                  <h4 className="font-bold text-large flex-1">{nodeDatum.id}</h4>
                  <Button size="small" className="ml-2">
                    编辑
                  </Button>
                  <Button size="small" style={{ padding: '4px', marginLeft: '4px' }}>
                    <PlayIcon />
                  </Button>
                </div>
                <div className="overflow-visible py-2">
                  <pre>{nodeDatum.data.content?.content || '(无)'}</pre>
                </div>
              </div>
            }
          >
            <div className="flex light items-center text-black rounded-lg px-2 bg-gray-700 text-gray-300">
              {nodeDatum.children ? (
                <RightIcon onClick={toggleNode} expand={!nodeDatum.__rd3t.collapsed} />
              ) : null}
              <div>{nodeDatum.id}</div>
            </div>
          </Tooltip>
        </div>
      </foreignObject>
    </g>
  )
}

export default function ThinkWorld() {
  const [translate, containerRef] = useCenteredTree()
  const [list, setList] = useState<any>(null)

  useEffect(() => {
    front.request('/think/getKenList', {}).then((res: any) => {
      console.log(res, 'think/getKenList:res')
      const list = (res.data as any[])
        .filter((value) => value.length)
        .map((value) => {
          return {
            ...value[0],
            parent: value[0].parent != '道' ? value[0].parent : '',
            all: value,
            children: null
          }
        })
      const data = d3
        .stratify<any>()
        .id((d) => d.name)
        .parentId((d) => d.parent)(list)
      setList(data)
      // setList(res.data)
    })
  }, [])
  const nodeSize = { x: 200, y: 200 }
  const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: 20 }

  return (
    <div className="h-full w-full flex flex-col" ref={containerRef}>
      {list ? (
        <Tree
          enableLegacyTransitions
          pathClassFunc={() => '!stroke-[#666]'}
          data={list}
          translate={translate}
          renderCustomNodeElement={(props) =>
            renderForeignObjectNode({ ...props, foreignObjectProps })
          }
          svgClassName="w-full flex-1"
        />
      ) : null}
    </div>
  )
}
