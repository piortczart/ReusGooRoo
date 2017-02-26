using System;
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
            return Regex.Matches(description, "(.+?) with (.+?) (.+) Aspect")
                .Cast<Match>()
                .SelectMany(
                    match1 =>
                            // This can simply be "Leaf" or "Toxic of Leaf"    
                            match1.Groups[3].Value.Trim()
                                // Make sure we split those pesky "or"s.
                                .Split(new[] { " or " }, StringSplitOptions.RemoveEmptyEntries)
                                .Select(aspectName => new { match = match1, aspectName })
                                // Make a transmutation out of every "or"
                                .Select(match => new Transmutation
                                {
                                    Aspect = new Aspect(match.match.Groups[2].Value.Trim(), match.aspectName),
                                    Target = match.match.Groups[1].Value.Trim()
                                })).ToArray();
        }
    }
}