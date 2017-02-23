using System.Linq;
using System.Text.RegularExpressions;

namespace ReusWikiDataDownload.GameClasses
{
    public class Transmutation
    {
        public string Target { get; set; }
        public Aspect Aspect { get; set; }

        public static Transmutation[] GetByDescription(string description)
        {
            return Regex.Matches(description, "(.+?) with (.+) (.+) Aspect")
                .Cast<Match>()
                .Select(match => new Transmutation
                {
                    Aspect = new Aspect
                    {
                        Name = match.Groups[3].Value.Trim(),
                        Strength = match.Groups[2].Value.Trim()
                    },
                    Target = match.Groups[1].Value.Trim()
                })
                .ToArray();
        }
    }
}
