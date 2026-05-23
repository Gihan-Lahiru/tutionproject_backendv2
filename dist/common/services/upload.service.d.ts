export declare class UploadService {
    private logger;
    uploadFile(file: any, folder: string): Promise<{
        secure_url: string;
        public_id: string;
        original_name: string;
    }>;
    deleteFile(publicId: string): Promise<{
        result: string;
    }>;
}
//# sourceMappingURL=upload.service.d.ts.map