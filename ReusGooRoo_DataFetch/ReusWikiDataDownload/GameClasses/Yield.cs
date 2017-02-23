using System.Linq;
using System.Text.RegularExpressions;

namespace ReusWikiDataDownload.GameClasses
{
    public class Yield
    {
        public string Name { get; set; }
        public int Amount { get; set; }

        public static Yield[] GetYieldsFromMetaDescription(string yieldsMeta)
        {
            return
                Regex.Matches(yieldsMeta, @"(\w+?)\|(.\d+)")
                .Cast<Match>()
                .Select(m => new Yield
                {
                    Name = m.Groups[1].Value,
                    Amount = int.Parse(m.Groups[2].Value)
                })
                .ToArray();
        }
    }
}
