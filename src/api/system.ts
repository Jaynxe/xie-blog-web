import service from "@/utils/request"

/* 获取站点信息 */
export const getSiteInfo = () => {
    return service.get("authrequired/getSiteInfo")
}
/* 修改站点信息 */
export const updateSiteInfo = (siteInfo: object) => {
    return service.patch("authrequired/updateSiteInfo", siteInfo)
}