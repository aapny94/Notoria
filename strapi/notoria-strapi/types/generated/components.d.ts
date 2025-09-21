import type { Schema, Struct } from '@strapi/strapi';

export interface ContentLinks extends Struct.ComponentSchema {
  collectionName: 'components_content_links';
  info: {
    displayName: 'Links';
    icon: 'link';
  };
  attributes: {};
}

export interface ContentMedia extends Struct.ComponentSchema {
  collectionName: 'components_content_media';
  info: {
    displayName: 'Media';
    icon: 'book';
  };
  attributes: {};
}

export interface ContentQuote extends Struct.ComponentSchema {
  collectionName: 'components_content_quotes';
  info: {
    displayName: 'Quote';
    icon: 'book';
  };
  attributes: {};
}

export interface ContentSummary extends Struct.ComponentSchema {
  collectionName: 'components_content_summaries';
  info: {
    displayName: 'summary';
    icon: 'calendar';
  };
  attributes: {};
}

export interface ContentTags extends Struct.ComponentSchema {
  collectionName: 'components_content_tags';
  info: {
    displayName: 'tags';
    icon: 'key';
  };
  attributes: {};
}

export interface ContentTitle extends Struct.ComponentSchema {
  collectionName: 'components_content_titles';
  info: {
    displayName: 'Title';
    icon: 'file';
  };
  attributes: {};
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {};
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'content.links': ContentLinks;
      'content.media': ContentMedia;
      'content.quote': ContentQuote;
      'content.summary': ContentSummary;
      'content.tags': ContentTags;
      'content.title': ContentTitle;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.slider': SharedSlider;
    }
  }
}
