declare module "*.png" {
  const url: string;
  export default url;
}

declare module "*.css" {
  const content: string;
  export default content;
}


declare module "*.asset.json" {
  const asset: {
    version: number;
    asset_id: string;
    project_id: string;
    url: string;
    r2_key: string;
    original_filename: string;
    size: number;
    content_type: string;
    created_at: string;
  };
  export default asset;
}
