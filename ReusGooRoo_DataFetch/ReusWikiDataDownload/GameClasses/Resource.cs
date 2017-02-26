using System.Collections.Generic;

namespace ReusWikiDataDownload.GameClasses
{
    public class Resource
    {
        public string Name { get; set; }
        public string Family { get; set; }
        public List<ResourceLevel> Levels { get; } = new List<ResourceLevel>();
        public Transmutation[] Transmutations { get; set; }
        public string AbilityNeeded { get; set; }
        public string Biome { get; set; }
    }
}
