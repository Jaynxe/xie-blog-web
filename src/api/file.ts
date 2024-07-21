import service from "@/utils/request";

export const imageUpload = (formData: FormData) => {
    return service.post('authrequired/uploadImages', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}