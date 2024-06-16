import service from "@/utils/request"

/* 获取站点信息 */
export const getSiteInfo = (token:string) => {
    return service.get("authrequired/getSiteInfo",  {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}