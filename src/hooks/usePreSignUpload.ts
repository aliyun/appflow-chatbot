import axios from "axios";

export interface FetchUploadResponseData {
  /** 文件全路径链接 */
  url?: string;
  /** 文件 oss key */
  key?: string;
  /** oss bucket name */
  bucketName?: string;
}

/**
 * 上传数据到指定bucket
 * @param file 文件
 * @param signedUrl 预签名URL
 * @returns
 */
export const fetchUploadApi = (
  file: Blob,
  signedUrl: string,
): Promise<FetchUploadResponseData> => {
  return new Promise<FetchUploadResponseData>((resolve, reject) => {
    // 发送 PUT 请求上传文件
    axios.put(signedUrl, file, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-oss-object-acl': 'private',
      },
    }).then(() => {
      // 文件上传成功 请求体为空 暂定判断 ok
      resolve({});
    }).catch(error => reject(error));
  });
};

export default fetchUploadApi;
