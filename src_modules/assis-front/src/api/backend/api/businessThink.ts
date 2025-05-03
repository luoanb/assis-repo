// @ts-ignore
/* eslint-disable */

/**
 * 该文件为 @umijs/openapi 插件自动生成，请勿随意修改。如需修改请通过配置 openapi.config.ts 进行定制化。
 * */

import { request, type RequestOptions } from '@/api/request';

/** 获取概念列表 GET /api/think */
export async function thinkList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ThinkListParams,
  options?: RequestOptions,
) {
  return request<API.ConceptEntity[]>('/api/think', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建或更新概念 POST /api/think */
export async function thinkPush(body: API.ConceptDto, options?: RequestOptions) {
  return request<any>('/api/think', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || { successMsg: '创建成功' }),
  });
}

/** 获取概念详情 GET /api/think/${param0} */
export async function thinkInfo(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ThinkInfoParams,
  options?: RequestOptions,
) {
  const { name: param0, ...queryParams } = params;
  return request<API.ConceptDto>(`/api/think/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除概念 DELETE /api/think/${param0} */
export async function thinkDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ThinkDeleteParams,
  options?: RequestOptions,
) {
  const { name: param0, ...queryParams } = params;
  return request<any>(`/api/think/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || { successMsg: '删除成功' }),
  });
}

/** 获取指定概念的子列表 GET /api/think/tree */
export async function thinkTree(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ThinkTreeParams,
  options?: RequestOptions,
) {
  return request<API.ConceptEntity[]>('/api/think/tree', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取游离节点 GET /api/think/treefree */
export async function thinkTreeFree(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ThinkTreeFreeParams,
  options?: RequestOptions,
) {
  return request<API.ConceptEntity[]>('/api/think/treefree', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
