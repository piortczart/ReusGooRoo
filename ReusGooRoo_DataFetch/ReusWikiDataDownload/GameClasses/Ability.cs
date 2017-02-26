using System.Text.RegularExpressions;

namespace ReusWikiDataDownload.GameClasses
{
    /// <summary>
    /// TODO: Possibly remove this class.
    /// </summary>
    public class Ability
    {
        public string Name { get; set; }
        public int Level { get; set; }
        public string Description { get; set; }

        public static string NameFromDescription(string description)
        {
            return FromDescription(description).Name;
        }

        public static Ability FromDescription(string description)
        {
            Match match = Regex.Match(description, @"level (\d+) (.+?) ability");
            return new Ability
            {
                Description = description,
                Level = int.Parse(match.Groups[1].Value),
                Name = match.Groups[2].Value
            };
        }
    }
}
