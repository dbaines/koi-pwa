Koi::Menu.items = {
  "Modules" => {

  },
  "Advanced" => {
    "Admins"       => "/admin/site_users",
    "URL History"  => "/admin/friendly_id_slugs",
    "URL Rewriter" => "/admin/url_rewrites"
  }
}

Koi::Settings.collection = {
  title:            { label: "Title",            group: "SEO", field_type: 'string', role: 'Admin' },
  meta_description: { label: "Meta Description", group: "SEO", field_type: 'text', role: 'Admin' },
  meta_keywords:    { label: "Meta Keywords",    group: "SEO", field_type: 'text', role: 'Admin' }
}

Koi::Settings.resource = {
  title:            { label: "Title",            group: "SEO", field_type: 'string', role: 'Admin' },
  meta_description: { label: "Meta Description", group: "SEO", field_type: 'text', role: 'Admin' },
  meta_keywords:    { label: "Meta Keywords",    group: "SEO", field_type: 'text', role: 'Admin' }
}
