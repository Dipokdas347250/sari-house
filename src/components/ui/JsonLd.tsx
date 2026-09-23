/**
 * schema.org ডেটা পাতায় বসানোর ছোট কম্পোনেন্ট।
 * ডেটা আমাদের নিজের ডাটাবেস থেকে আসে, তাই JSON.stringify করেই নিরাপদ —
 * তবু `<` চিহ্নটা এস্কেপ করা হয় যাতে স্ক্রিপ্ট ট্যাগ ভেঙে না যায়।
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
