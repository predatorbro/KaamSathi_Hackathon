export const storage = {
  getResumeData: () => {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem("resumeData")
    return data ? JSON.parse(data) : null
  },

  setResumeData: (data: any) => {
    if (typeof window === "undefined") return
    localStorage.setItem("resumeData", JSON.stringify(data))
  },

  getUser: () => {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem("userData")
    return data ? JSON.parse(data) : null
  },

  setUser: (data: any) => {
    if (typeof window === "undefined") return
    localStorage.setItem("userData", JSON.stringify(data))
  },
}
