import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
    name: 'wedflow',
    title: 'Wedflow CMS',

    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

    plugins: [
        structureTool({
            structure: (S) =>
                S.list()
                    .title('Content')
                    .items([
                        // Wedding Templates
                        S.listItem()
                            .title('Wedding Templates')
                            .child(
                                S.documentTypeList('weddingTemplate')
                                    .title('Wedding Templates')
                                    .filter('_type == "weddingTemplate"')
                            ),

                        // Todo Templates
                        S.listItem()
                            .title('Todo Templates')
                            .child(
                                S.documentTypeList('todoTemplate')
                                    .title('Todo Templates')
                                    .filter('_type == "todoTemplate"')
                            ),

                        // Vendor Categories
                        S.listItem()
                            .title('Vendor Categories')
                            .child(
                                S.documentTypeList('vendorCategory')
                                    .title('Vendor Categories')
                                    .filter('_type == "vendorCategory"')
                            ),
                    ])
        }),
        visionTool(),
    ],

    schema: {
        types: schemaTypes,
    },

    // Custom studio configuration
    studio: {
        components: {
            // Custom navbar component could go here
        }
    }
})