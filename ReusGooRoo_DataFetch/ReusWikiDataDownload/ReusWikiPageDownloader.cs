using System.Net;
using System.Threading.Tasks;
using HtmlAgilityPack;

namespace ReusWikiDataDownload
{
    public class ReusWikiPageDownloader
    {
        public async Task<HtmlNode> GetPage(string url)
        {
            using (WebClient wc = new WebClient())
            {
                var doc = new HtmlDocument();
                doc.LoadHtml(await wc.DownloadStringTaskAsync("http://wiki.reusgame.com" + url));
                return doc.DocumentNode;
            }
        }
    }
}